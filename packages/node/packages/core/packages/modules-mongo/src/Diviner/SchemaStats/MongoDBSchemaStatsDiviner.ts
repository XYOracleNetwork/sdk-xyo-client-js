import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, AddressSpaceDiviner, DivinerConfig, DivinerModule, DivinerParams, DivinerWrapper } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isSchemaStatsQueryPayload,
  PayloadWithMeta,
  SchemaStatsDiviner,
  SchemaStatsPayload,
  SchemaStatsQueryPayload,
  SchemaStatsSchema,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk, MongoClientWrapper } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { ChangeStream, ChangeStreamInsertDocument, ChangeStreamOptions, ResumeToken, UpdateOptions } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { BatchIterator, fromDbProperty, toDbProperty } from '../../Util'

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

export type MongoDBSchemaStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'
export const MongoDBSchemaStatsDivinerConfigSchema: MongoDBSchemaStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.schema'

export type MongoDBSchemaStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  WithAdditional<
    Payload,
    T & {
      schema: MongoDBSchemaStatsDivinerConfigSchema
    }
  >
>

export type MongoDBSchemaStatsDivinerParams<T extends Payload = Payload> = DivinerParams<
  AnyConfigSchema<MongoDBSchemaStatsDivinerConfig<T>>,
  {
    addressSpaceDiviner: AddressSpaceDiviner
    payloadSdk: BaseMongoSdk<PayloadWithMeta>
  }
>

export class MongoDBSchemaStatsDiviner<TParams extends MongoDBSchemaStatsDivinerParams = MongoDBSchemaStatsDivinerParams>
  extends AbstractDiviner<TParams>
  implements SchemaStatsDiviner, JobProvider, DivinerModule
{
  static override configSchema = MongoDBSchemaStatsDivinerConfigSchema

  /**
   * The max number of records to search during the aggregate query
   */
  protected readonly aggregateLimit = 100_000

  /**
   * The max number of iterations of aggregate queries to allow when
   * divining the schema stats within an archive
   */
  protected readonly aggregateMaxIterations = 10_000

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  protected backgroundDivineTask: Promise<void> | undefined

  /**
   * The max number of simultaneous archives to divine at once
   */
  protected readonly batchLimit = 100

  // Lint rule required to allow for use of batchLimit constant
  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected readonly batchIterator: BatchIterator<string> = new BatchIterator([], this.batchLimit)

  /**
   * The stream with which the diviner is notified of insertions
   * to the payloads collection
   */
  protected changeStream: ChangeStream | undefined = undefined
  /**
   * The counts per schema to update on the next update interval
   */
  protected pendingCounts: Record<string, Record<string, number>> = {}
  /**
   * The resume token for listening to insertions into the payload collection
   */
  protected resumeAfter: ResumeToken | undefined = undefined

  get jobs(): Job[] {
    return [
      {
        name: 'MongoDBSchemaStatsDiviner.UpdateChanges',
        onSuccess: () => {
          this.pendingCounts = {}
        },
        schedule: '1 minute',
        task: async () => await this.updateChanges(),
      },
      {
        name: 'MongoDBSchemaStatsDiviner.DivineAddressesBatch',
        schedule: '5 minute',
        task: async () => await this.divineAddressesBatch(),
      },
    ]
  }

  override async divine(payloads?: Payload[]): Promise<Payload<SchemaStatsPayload>[]> {
    const query = payloads?.find<SchemaStatsQueryPayload>(isSchemaStatsQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<SchemaStatsPayload>({ schema: SchemaStatsSchema }).fields({ count }).build())
  }

  override async start() {
    await super.start()
    await this.registerWithChangeStream()
  }

  protected override async stop(): Promise<this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private backgroundDivine = async (): Promise<void> => {
    for (const addresses of this.batchIterator) {
      for (const address of addresses) {
        try {
          await this.divineAddressFull(address)
          await delay(10)
        } catch (error) {
          this.logger?.log(`MongoDBSchemaStatsDiviner.BackgroundDivine: ${error}`)
        }
      }
    }
    this.backgroundDivineTask = undefined
  }

  private divineAddress = async (archive: string): Promise<Record<string, number>> => {
    const stats = await this.params.payloadSdk.useMongo(async (mongo) => {
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
      const result: PayloadSchemaCountsAggregateResult[] = await this.params.payloadSdk.useCollection((collection) => {
        return collection
          .aggregate()
          .sort({ _archive: 1, _timestamp: 1 })
          .match({ _archive: archive, _timestamp: { $lt: sortStartTime } })
          .skip(iteration * this.aggregateLimit)
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
    this.logger?.log('MongoDBSchemaStatsDiviner.DivineAddressesBatch: Updating Addresses')
    const addressSpaceDiviner = assertEx(
      this.params.addressSpaceDiviner,
      'MongoDBSchemaStatsDiviner.DivineAddressesBatch: Missing AddressSpaceDiviner',
    )
    const result = (await new DivinerWrapper({ module: addressSpaceDiviner }).divine([])) || []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    const additions = this.batchIterator.addValues(addresses)
    this.logger?.log(`MongoDBSchemaStatsDiviner.DivineAddressesBatch: Updating with ${additions} new addresses`)
    if (!this.backgroundDivineTask) this.backgroundDivineTask = this.backgroundDivine()
  }

  private divineAllAddresses = async () => await Promise.reject('Not Implemented')

  private processChange = (change: ChangeStreamInsertDocument<PayloadWithMeta>) => {
    this.resumeAfter = change._id
    const archive = change.fullDocument._archive
    const schema = change.fullDocument.schema
    if (archive && schema) {
      if (!this.pendingCounts[archive]) this.pendingCounts[archive] = {}
      this.pendingCounts[archive][schema] = (this.pendingCounts[archive][schema] || 0) + 1
    }
  }

  private registerWithChangeStream = async () => {
    this.logger?.log('MongoDBSchemaStatsDiviner.RegisterWithChangeStream: Registering')
    const wrapper = MongoClientWrapper.get(this.params.payloadSdk.uri, this.params.payloadSdk.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, 'Connection failed')
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.Payloads)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log('MongoDBSchemaStatsDiviner.RegisterWithChangeStream: Registered')
  }

  private storeDivinedResult = async (archive: string, counts: Record<string, number>) => {
    const sanitizedCounts: Record<string, number> = Object.fromEntries(
      Object.entries(counts).map(([schema, count]) => {
        return [toDbProperty(schema), count]
      }),
    )
    await this.params.payloadSdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive }, { $set: { ['schema.count']: sanitizedCounts } }, updateOptions)
    })
    this.pendingCounts[archive] = {}
  }

  private updateChanges = async () => {
    this.logger?.log('MongoDBSchemaStatsDiviner.UpdateChanges: Updating')
    const updates = Object.keys(this.pendingCounts).map((archive) => {
      const $inc = Object.keys(this.pendingCounts[archive])
        .map((schema) => {
          return { [`schema.count.${toDbProperty(schema)}`]: this.pendingCounts[archive][schema] }
        })
        .reduce((prev, curr) => Object.assign(prev, curr), {})
      this.pendingCounts[archive] = {}
      return this.params.payloadSdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`MongoDBSchemaStatsDiviner.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
