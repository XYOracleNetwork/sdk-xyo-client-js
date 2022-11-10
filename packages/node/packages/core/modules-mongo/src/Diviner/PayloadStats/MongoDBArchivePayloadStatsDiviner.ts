import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { XyoDiviner, XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import {
  ArchiveArchivist,
  Initializable,
  isPayloadStatsQueryPayload,
  PayloadStatsDiviner,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsSchema,
  XyoPayloadWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayload, XyoPayloadBuilder, XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk, MongoClientWrapper } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { ChangeStream, ChangeStreamInsertDocument, ChangeStreamOptions, ResumeToken, UpdateOptions } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { getBaseMongoSdk } from '../../Mongo'

const updateOptions: UpdateOptions = { upsert: true }

interface Stats {
  archive: string
  payloads?: {
    count?: number
  }
}

export type MongoDBArchivePayloadStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.payload'
export const MongoDBArchivePayloadStatsDivinerConfigSchema: MongoDBArchivePayloadStatsDivinerConfigSchema =
  'network.xyo.module.config.diviner.stats.payload'

export type MongoDBArchivePayloadStatsDivinerConfig<T extends XyoPayload = XyoPayload> = XyoDivinerConfig<
  XyoPayload,
  T & {
    schema: MongoDBArchivePayloadStatsDivinerConfigSchema
  }
>

export interface MongoDBArchivePayloadStatsDivinerParams<T extends XyoPayload = XyoPayload>
  extends XyoModuleParams<MongoDBArchivePayloadStatsDivinerConfig<T>> {
  archiveArchivist: ArchiveArchivist
}

export class MongoDBArchivePayloadStatsDiviner extends XyoDiviner implements PayloadStatsDiviner, Initializable, JobProvider {
  protected archiveArchivist: ArchiveArchivist | undefined
  protected readonly batchLimit = 100
  protected changeStream: ChangeStream | undefined = undefined
  protected nextOffset = 0
  protected pendingCounts: Record<string, number> = {}
  protected resumeAfter: ResumeToken | undefined = undefined
  protected readonly sdk: BaseMongoSdk<XyoPayload> = getBaseMongoSdk<XyoPayload>(COLLECTIONS.Payloads)

  protected constructor(params: MongoDBArchivePayloadStatsDivinerParams) {
    super(params)
    this.archiveArchivist = params.archiveArchivist
  }

  get jobs(): Job[] {
    return [
      {
        name: 'MongoDBArchivePayloadStatsDiviner.UpdateChanges',
        onSuccess: () => {
          this.pendingCounts = {}
        },
        schedule: '1 minute',
        task: async () => await this.updateChanges(),
      },
      {
        name: 'MongoDBArchivePayloadStatsDiviner.DivineArchivesBatch',
        schedule: '10 minute',
        task: async () => await this.divineArchivesBatch(),
      },
    ]
  }

  static override async create(params: MongoDBArchivePayloadStatsDivinerParams): Promise<MongoDBArchivePayloadStatsDiviner> {
    return (await super.create(params)) as MongoDBArchivePayloadStatsDiviner
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayloads<PayloadStatsPayload>> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    const archive = query?.archive
    const count = archive ? await this.divineArchive(archive) : await this.divineAllArchives()
    return [new XyoPayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsSchema }).fields({ count }).build()]
  }

  async initialize(): Promise<void> {
    await this.start()
  }

  protected override async start(): Promise<typeof this> {
    await this.registerWithChangeStream()
    return await super.start()
  }

  protected override async stop(): Promise<typeof this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private divineAllArchives = () => this.sdk.useCollection((collection) => collection.estimatedDocumentCount())

  private divineArchive = async (archive: string) => {
    const stats = await this.sdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ archive })
    })
    const remote = stats?.payloads?.count || 0
    const local = this.pendingCounts[archive] || 0
    return remote + local
  }

  private divineArchiveFull = async (archive: string) => {
    const count = await this.sdk.useCollection((collection) => collection.countDocuments({ _archive: archive }))
    await this.storeDivinedResult(archive, count)
    return count
  }

  private divineArchivesBatch = async () => {
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineArchivesBatch: Divining - Limit: ${this.batchLimit} Offset: ${this.nextOffset}`)
    const result = (await this.archiveArchivist?.find({ limit: this.batchLimit, offset: this.nextOffset })) || []
    const archives = result.map((archive) => archive?.archive).filter(exists)
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineArchivesBatch: Divining ${archives.length} Archives`)
    this.nextOffset = archives.length < this.batchLimit ? 0 : this.nextOffset + this.batchLimit
    const results = await Promise.allSettled(archives.map(this.divineArchiveFull))
    const succeeded = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.filter((result) => result.status === 'rejected').length
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineArchivesBatch: Divined - Succeeded: ${succeeded} Failed: ${failed}`)
  }

  private processChange = (change: ChangeStreamInsertDocument<XyoPayloadWithMeta>) => {
    this.resumeAfter = change._id
    const archive = change.fullDocument._archive
    if (archive) this.pendingCounts[archive] = (this.pendingCounts[archive] || 0) + 1
  }

  private registerWithChangeStream = async () => {
    this.logger?.log('MongoDBArchivePayloadStatsDiviner.RegisterWithChangeStream: Registering')
    const wrapper = MongoClientWrapper.get(this.sdk.uri, this.sdk.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.Payloads)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log('MongoDBArchivePayloadStatsDiviner.RegisterWithChangeStream: Registered')
  }

  private storeDivinedResult = async (archive: string, count: number) => {
    await this.sdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive }, { $set: { [`${COLLECTIONS.Payloads}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[archive] = 0
  }

  private updateChanges = async () => {
    this.logger?.log('MongoDBArchivePayloadStatsDiviner.UpdateChanges: Updating')
    const updates = Object.keys(this.pendingCounts).map((archive) => {
      const count = this.pendingCounts[archive]
      this.pendingCounts[archive] = 0
      const $inc = { [`${COLLECTIONS.Payloads}.count`]: count }
      return this.sdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter((result) => result.status === 'fulfilled').length
    const failed = results.filter((result) => result.status === 'rejected').length
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
