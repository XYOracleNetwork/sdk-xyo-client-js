import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module'
import {
  BoundWitnessStatsDiviner,
  BoundWitnessStatsPayload,
  BoundWitnessStatsQueryPayload,
  BoundWitnessStatsSchema,
  isBoundWitnessStatsQueryPayload,
  XyoBoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk, MongoClientWrapper } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { ChangeStream, ChangeStreamInsertDocument, ChangeStreamOptions, ResumeToken, UpdateOptions } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { getBaseMongoSdk } from '../../Mongo'

const updateOptions: UpdateOptions = { upsert: true }

interface Stats {
  archive: string
  bound_witnesses?: {
    count?: number
  }
}

export type MongoDBArchiveBoundWitnessStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.boundwitness'
export const MongoDBArchiveBoundWitnessStatsDivinerConfigSchema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema =
  'network.xyo.module.config.diviner.stats.boundwitness'

export type MongoDBArchiveBoundWitnessStatsDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  WithAdditional<
    XyoPayload,
    T & {
      schema: MongoDBArchiveBoundWitnessStatsDivinerConfigSchema
    }
  >
>
export type MongoDBArchiveBoundWitnessStatsDivinerParams<T extends XyoPayload = XyoPayload> = ModuleParams<
  AnyConfigSchema<MongoDBArchiveBoundWitnessStatsDivinerConfig<T>>
>

export class MongoDBArchiveBoundWitnessStatsDiviner<
    TParams extends MongoDBArchiveBoundWitnessStatsDivinerParams = MongoDBArchiveBoundWitnessStatsDivinerParams,
  >
  extends AbstractDiviner<TParams>
  implements BoundWitnessStatsDiviner, JobProvider
{
  static override configSchema = MongoDBArchiveBoundWitnessStatsDivinerConfigSchema

  protected readonly batchLimit = 100
  protected changeStream: ChangeStream | undefined = undefined
  protected nextOffset = 0
  protected pendingCounts: Record<string, number> = {}
  protected resumeAfter: ResumeToken | undefined = undefined

  private _sdk?: BaseMongoSdk<XyoBoundWitnessWithMeta>

  get jobs(): Job[] {
    return [
      {
        name: 'MongoDBArchiveBoundWitnessStatsDiviner.UpdateChanges',
        onSuccess: () => {
          this.pendingCounts = {}
        },
        schedule: '1 minute',
        task: async () => await this.updateChanges(),
      },
      {
        name: 'MongoDBArchiveBoundWitnessStatsDiviner.DivineArchivesBatch',
        schedule: '10 minute',
        task: async () => await this.divineArchivesBatch(),
      },
    ]
  }

  protected get sdk() {
    this._sdk = this._sdk ?? getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    return this._sdk
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<BoundWitnessStatsPayload>> {
    const query = payloads?.find<BoundWitnessStatsQueryPayload>(isBoundWitnessStatsQueryPayload)
    const archive = query?.archive
    const count = archive ? await this.divineArchive(archive) : await this.divineAllArchives()
    return [new XyoPayloadBuilder<BoundWitnessStatsPayload>({ schema: BoundWitnessStatsSchema }).fields({ count }).build()]
  }

  override async start() {
    await super.start()
    await this.registerWithChangeStream()
  }

  protected override async stop(): Promise<this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private divineAllArchives = () => this.sdk.useCollection((collection) => collection.estimatedDocumentCount())

  private divineArchive = async (archive: string) => {
    const stats = await this.sdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ archive })
    })
    const remote = stats?.bound_witnesses?.count || 0
    const local = this.pendingCounts[archive] || 0
    return remote + local
  }

  private divineArchiveFull = async (archive: string) => {
    const count = await this.sdk.useCollection((collection) => collection.countDocuments({ _archive: archive }))
    await this.storeDivinedResult(archive, count)
    return count
  }

  private divineArchivesBatch = async () => {
    this.logger?.log(`MongoDBArchiveBoundWitnessStatsDiviner.DivineArchivesBatch: Divining - Limit: ${this.batchLimit} Offset: ${this.nextOffset}`)
    await Promise.resolve()
    // TODO: Look across address space and divine
    // const result = (await this.archiveArchivist?.find({ limit: this.batchLimit, offset: this.nextOffset })) || []
    // const archives = result.map((archive) => archive?.archive).filter(exists)
    // this.logger?.log(`MongoDBArchiveBoundWitnessStatsDiviner.DivineArchivesBatch: Divining ${archives.length} Archives`)
    // this.nextOffset = archives.length < this.batchLimit ? 0 : this.nextOffset + this.batchLimit
    // const results = await Promise.allSettled(archives.map(this.divineArchiveFull))
    // const succeeded = results.filter(fulfilled).length
    // const failed = results.filter(rejected).length
    // this.logger?.log(`MongoDBArchiveBoundWitnessStatsDiviner.DivineArchivesBatch: Divined - Succeeded: ${succeeded} Failed: ${failed}`)
  }

  private processChange = (change: ChangeStreamInsertDocument<XyoBoundWitnessWithMeta>) => {
    this.resumeAfter = change._id
    const archive = change.fullDocument._archive
    if (archive) this.pendingCounts[archive] = (this.pendingCounts[archive] || 0) + 1
  }

  private registerWithChangeStream = async () => {
    this.logger?.log('MongoDBArchiveBoundWitnessStatsDiviner.RegisterWithChangeStream: Registering')
    const wrapper = MongoClientWrapper.get(this.sdk.uri, this.sdk.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.BoundWitnesses)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log('MongoDBArchiveBoundWitnessStatsDiviner.RegisterWithChangeStream: Registered')
  }

  private storeDivinedResult = async (archive: string, count: number) => {
    await this.sdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive }, { $set: { [`${COLLECTIONS.BoundWitnesses}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[archive] = 0
  }

  private updateChanges = async () => {
    this.logger?.log('MongoDBArchiveBoundWitnessStatsDiviner.UpdateChanges: Updating')
    const updates = Object.keys(this.pendingCounts).map((archive) => {
      const count = this.pendingCounts[archive]
      this.pendingCounts[archive] = 0
      const $inc = { [`${COLLECTIONS.BoundWitnesses}.count`]: count }
      return this.sdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBArchiveBoundWitnessStatsDiviner.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
