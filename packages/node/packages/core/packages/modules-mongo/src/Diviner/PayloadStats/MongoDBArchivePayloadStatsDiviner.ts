import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, AddressSpaceDiviner, DivinerConfig, DivinerModuleEventData, DivinerParams, DivinerWrapper } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isPayloadStatsQueryPayload,
  PayloadStatsDiviner,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsSchema,
  XyoPayloadWithMeta,
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
  payloads?: {
    count?: number
  }
}

export type MongoDBArchivePayloadStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.payload'
export const MongoDBArchivePayloadStatsDivinerConfigSchema: MongoDBArchivePayloadStatsDivinerConfigSchema =
  'network.xyo.module.config.diviner.stats.payload'

export type MongoDBArchivePayloadStatsDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  WithAdditional<
    XyoPayload,
    T & {
      schema: MongoDBArchivePayloadStatsDivinerConfigSchema
    }
  >
>

export type MongoDBArchivePayloadStatsDivinerParams<T extends XyoPayload = XyoPayload> = DivinerParams<
  AnyConfigSchema<MongoDBArchivePayloadStatsDivinerConfig<T>>,
  DivinerModuleEventData,
  {
    addressSpaceDiviner: AddressSpaceDiviner
  }
>

export class MongoDBArchivePayloadStatsDiviner<TParams extends MongoDBArchivePayloadStatsDivinerParams = MongoDBArchivePayloadStatsDivinerParams>
  extends AbstractDiviner<TParams>
  implements PayloadStatsDiviner, JobProvider
{
  static override configSchema = MongoDBArchivePayloadStatsDivinerConfigSchema

  protected readonly batchLimit = 100
  protected changeStream: ChangeStream | undefined = undefined
  protected nextOffset = 0
  protected pendingCounts: Record<string, number> = {}
  protected resumeAfter: ResumeToken | undefined = undefined
  protected readonly sdk: BaseMongoSdk<XyoPayload> = getBaseMongoSdk<XyoPayload>(COLLECTIONS.Payloads)

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
        task: async () => await this.divineAddressesBatch(),
      },
    ]
  }

  async divine(payloads?: XyoPayloads): Promise<XyoPayloads<PayloadStatsPayload>> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    const address = query?.archive
    const count = address ? await this.divineAddress(address) : await this.divineAllAddresses()
    return [new XyoPayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsSchema }).fields({ count }).build()]
  }

  override async start() {
    await super.start()
    await this.registerWithChangeStream()
  }

  protected override async stop(): Promise<this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private divineAddress = async (address: string) => {
    const stats = await this.sdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ archive: address })
    })
    const remote = stats?.payloads?.count || 0
    const local = this.pendingCounts[address] || 0
    return remote + local
  }

  private divineAddressFull = async (address: string) => {
    const count = await this.sdk.useCollection((collection) => collection.countDocuments({ _archive: address }))
    await this.storeDivinedResult(address, count)
    return count
  }

  private divineAddressesBatch = async () => {
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineAddressesBatch: Divining - Limit: ${this.batchLimit} Offset: ${this.nextOffset}`)
    await Promise.resolve()
    const addressSpaceDiviner = assertEx(this.params.addressSpaceDiviner)
    const result = (await new DivinerWrapper({ module: addressSpaceDiviner }).divine([])) || []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineAddressesBatch: Divining ${addresses.length} Archives`)
    this.nextOffset = addresses.length < this.batchLimit ? 0 : this.nextOffset + this.batchLimit
    const results = await Promise.allSettled(addresses.map(this.divineAddressFull))
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.DivineAddressesBatch: Divined - Succeeded: ${succeeded} Failed: ${failed}`)
  }

  private divineAllAddresses = () => this.sdk.useCollection((collection) => collection.estimatedDocumentCount())

  private processChange = (change: ChangeStreamInsertDocument<XyoPayloadWithMeta>) => {
    this.resumeAfter = change._id
    const address = change.fullDocument._archive
    if (address) this.pendingCounts[address] = (this.pendingCounts[address] || 0) + 1
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

  private storeDivinedResult = async (address: string, count: number) => {
    await this.sdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive: address }, { $set: { [`${COLLECTIONS.Payloads}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[address] = 0
  }

  private updateChanges = async () => {
    this.logger?.log('MongoDBArchivePayloadStatsDiviner.UpdateChanges: Updating')
    const updates = Object.keys(this.pendingCounts).map((address) => {
      const count = this.pendingCounts[address]
      this.pendingCounts[address] = 0
      const $inc = { [`${COLLECTIONS.Payloads}.count`]: count }
      return this.sdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive: address }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBArchivePayloadStatsDiviner.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
