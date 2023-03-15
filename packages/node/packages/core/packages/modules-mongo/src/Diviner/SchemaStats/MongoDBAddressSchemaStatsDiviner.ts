import { assertEx } from '@xylabs/assert'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, AddressSpaceDiviner, DivinerConfig, DivinerModule, DivinerParams, DivinerWrapper } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isSchemaStatsQueryPayload,
  SchemaStatsDiviner,
  SchemaStatsPayload,
  SchemaStatsQueryPayload,
  SchemaStatsSchema,
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
import { fromDbProperty, toDbProperty } from '../../Util'

const updateOptions: UpdateOptions = { upsert: true }

interface PayloadSchemaCountsAggregateResult {
  _id: string
  count: number
}

interface Stats {
  archive: string
  schema?: {
    count?: Record<string, number>
  }
}

export type MongoDBAddressSchemaStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'
export const MongoDBAddressSchemaStatsDivinerConfigSchema: MongoDBAddressSchemaStatsDivinerConfigSchema =
  'network.xyo.module.config.diviner.stats.schema'

export type MongoDBAddressSchemaStatsDivinerConfig<T extends XyoPayload = XyoPayload> = DivinerConfig<
  WithAdditional<
    XyoPayload,
    T & {
      schema: MongoDBAddressSchemaStatsDivinerConfigSchema
    }
  >
>

export type MongoDBAddressSchemaStatsDivinerParams<T extends XyoPayload = XyoPayload> = DivinerParams<
  AnyConfigSchema<MongoDBAddressSchemaStatsDivinerConfig<T>>,
  {
    addressSpaceDiviner: AddressSpaceDiviner
  }
>

export class MongoDBAddressSchemaStatsDiviner<TParams extends MongoDBAddressSchemaStatsDivinerParams = MongoDBAddressSchemaStatsDivinerParams>
  extends AbstractDiviner<TParams>
  implements SchemaStatsDiviner, JobProvider, DivinerModule
{
  static override configSchema = MongoDBAddressSchemaStatsDivinerConfigSchema

  /**
   * The max number of records to search during the aggregate query
   */
  protected readonly aggregateLimit = 5_000_000

  /**
   * The max number of iterations of aggregate queries to allow when
   * divining the schema stats within an archive
   */
  protected readonly aggregateMaxIterations = 10_000

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  /**
   * The max number of simultaneous archives to divine at once
   */
  protected readonly batchLimit = 100
  /**
   * The stream with which the diviner is notified of insertions
   * to the payloads collection
   */
  protected changeStream: ChangeStream | undefined = undefined
  /**
   * The next offset from which to begin batch divining archives
   */
  protected nextOffset = 0
  /**
   * The counts per schema to update on the next update interval
   */
  protected pendingCounts: Record<string, Record<string, number>> = {}
  /**
   * The resume token for listening to insertions into the payload collection
   */
  protected resumeAfter: ResumeToken | undefined = undefined

  protected readonly sdk: BaseMongoSdk<XyoPayload> = getBaseMongoSdk<XyoPayload>(COLLECTIONS.Payloads)

  get jobs(): Job[] {
    return [
      {
        name: 'MongoDBAddressSchemaStatsDiviner.UpdateChanges',
        onSuccess: () => {
          this.pendingCounts = {}
        },
        schedule: '1 minute',
        task: async () => await this.updateChanges(),
      },
      {
        name: 'MongoDBAddressSchemaStatsDiviner.DivineAddressesBatch',
        schedule: '20 minute',
        task: async () => await this.divineAddressesBatch(),
      },
    ]
  }

  override async divine(payloads?: XyoPayloads): Promise<XyoPayloads<SchemaStatsPayload>> {
    const query = payloads?.find<SchemaStatsQueryPayload>(isSchemaStatsQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new XyoPayloadBuilder<SchemaStatsPayload>({ schema: SchemaStatsSchema }).fields({ count }).build())
  }

  override async start() {
    await super.start()
    await this.registerWithChangeStream()
  }

  protected override async stop(): Promise<this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private divineAddress = async (archive: string): Promise<Record<string, number>> => {
    const stats = await this.sdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ archive })
    })
    const remote = Object.fromEntries(
      Object.entries(stats?.schema?.count || {}).map(([schema, count]) => {
        return [fromDbProperty(schema), count]
      }),
    )
    const local = this.pendingCounts[archive] || {}
    const keys = [...Object.keys(local), ...Object.keys(remote).map(fromDbProperty)]
    const ret = Object.fromEntries(
      keys.map((key) => {
        const localSchemaCount = local[key] || 0
        const remoteSchemaCount = remote[key] || 0
        const value = localSchemaCount + remoteSchemaCount
        return [key, value]
      }),
    )
    return ret
  }

  private divineAddressFull = async (archive: string): Promise<Record<string, number>> => {
    const sortStartTime = Date.now()
    const totals: Record<string, number> = {}
    for (let iteration = 0; iteration < this.aggregateMaxIterations; iteration++) {
      const result: PayloadSchemaCountsAggregateResult[] = await this.sdk.useCollection((collection) => {
        return collection
          .aggregate()
          .sort({ _archive: 1, _timestamp: 1 })
          .match({ _archive: archive, _timestamp: { $lt: sortStartTime } })
          .skip(iteration)
          .limit(this.aggregateLimit)
          .group<PayloadSchemaCountsAggregateResult>({ _id: '$schema', count: { $sum: 1 } })
          .maxTimeMS(this.aggregateTimeoutMs)
          .toArray()
      })
      if (result.length < 1) break
      // Add current counts to total
      result.map((schema) => {
        totals[schema._id] = totals[schema._id] || 0 + schema.count
      })
    }
    await this.storeDivinedResult(archive, totals)
    return totals
  }

  private divineAddressesBatch = async () => {
    this.logger?.log(`MongoDBAddressSchemaStatsDiviner.DivineAddressesBatch: Divining - Limit: ${this.batchLimit} Offset: ${this.nextOffset}`)
    const addressSpaceDiviner = assertEx(this.params.addressSpaceDiviner)
    const result = (await new DivinerWrapper({ module: addressSpaceDiviner }).divine([])) || []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    this.logger?.log(`MongoDBAddressSchemaStatsDiviner.DivineAddressesBatch: Divining ${addresses.length} Addresses`)
    this.nextOffset = addresses.length < this.batchLimit ? 0 : this.nextOffset + this.batchLimit
    const results = await Promise.allSettled(addresses.map(this.divineAddressFull))
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBAddressSchemaStatsDiviner.DivineAddressesBatch: Divined - Succeeded: ${succeeded} Failed: ${failed}`)
  }

  private divineAllAddresses = async () => await Promise.reject('Not Implemented')

  private processChange = (change: ChangeStreamInsertDocument<XyoPayloadWithMeta>) => {
    this.resumeAfter = change._id
    const archive = change.fullDocument._archive
    const schema = change.fullDocument.schema
    if (archive && schema) {
      if (!this.pendingCounts[archive]) this.pendingCounts[archive] = {}
      this.pendingCounts[archive][schema] = (this.pendingCounts[archive][schema] || 0) + 1
    }
  }

  private registerWithChangeStream = async () => {
    this.logger?.log('MongoDBAddressSchemaStatsDiviner.RegisterWithChangeStream: Registering')
    const wrapper = MongoClientWrapper.get(this.sdk.uri, this.sdk.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.Payloads)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log('MongoDBAddressSchemaStatsDiviner.RegisterWithChangeStream: Registered')
  }

  private storeDivinedResult = async (archive: string, counts: Record<string, number>) => {
    const sanitizedCounts: Record<string, number> = Object.fromEntries(
      Object.entries(counts).map(([schema, count]) => {
        return [toDbProperty(schema), count]
      }),
    )
    await this.sdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive }, { $set: { ['schema.count']: sanitizedCounts } }, updateOptions)
    })
    this.pendingCounts[archive] = {}
  }

  private updateChanges = async () => {
    this.logger?.log('MongoDBAddressSchemaStatsDiviner.UpdateChanges: Updating')
    const updates = Object.keys(this.pendingCounts).map((archive) => {
      const $inc = Object.keys(this.pendingCounts[archive])
        .map((schema) => {
          return { [`schema.count.${toDbProperty(schema)}`]: this.pendingCounts[archive][schema] }
        })
        .reduce((prev, curr) => Object.assign(prev, curr), {})
      this.pendingCounts[archive] = {}
      return this.sdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBAddressSchemaStatsDiviner.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
