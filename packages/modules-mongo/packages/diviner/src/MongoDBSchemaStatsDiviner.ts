import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { SchemaStatsDiviner } from '@xyo-network/diviner-schema-stats-abstract'
import {
  isSchemaStatsQueryPayload,
  SchemaStatsDivinerConfigSchema,
  SchemaStatsDivinerSchema,
  SchemaStatsPayload,
  SchemaStatsQueryPayload,
} from '@xyo-network/diviner-schema-stats-model'
import { COLLECTIONS, DATABASES, fromDbProperty, MongoDBModuleMixin, toDbProperty } from '@xyo-network/module-abstract-mongodb'
import { TYPES } from '@xyo-network/node-core-types'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BoundWitnessWithMeta } from '@xyo-network/payload-mongodb'
import { MongoClientWrapper } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { ChangeStream, ChangeStreamInsertDocument, ChangeStreamOptions, ResumeToken, UpdateOptions } from 'mongodb'

import { defineJobs, scheduleJobs } from './JobQueue'
import { SetIterator } from './SetIterator'

const updateOptions: UpdateOptions = { upsert: true }

interface PayloadSchemaCountsAggregateResult {
  _id: string
  count: number
}

interface Stats {
  address: string
  schema?: {
    count?: Record<string, number>
  }
}

const MongoDBDivinerBase = MongoDBModuleMixin(SchemaStatsDiviner)

const moduleName = 'MongoDBSchemaStatsDiviner'

export class MongoDBSchemaStatsDiviner extends MongoDBDivinerBase implements JobProvider {
  static override configSchemas = [SchemaStatsDivinerConfigSchema]

  /**
   * Iterates over know addresses obtained from AddressDiviner
   */
  protected readonly addressIterator: SetIterator<string> = new SetIterator([])

  /**
   * The max number of records to search during the aggregate query
   */
  protected readonly aggregateLimit = 1_000

  /**
   * The max number of iterations of aggregate queries to allow when
   * divining the schema stats for a single address
   */
  protected readonly aggregateMaxIterations = 1_000_000

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  /**
   * The interval at which the background divine task will run. Prevents
   * continuously iterating over DB and exhausting DB resources
   */
  protected readonly backgroundDivineIntervalMs = 250

  /**
   * A reference to the background task to ensure that the
   * continuous background divine stays running
   */
  protected backgroundDivineTask: Promise<void> | undefined

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
        name: `${moduleName}.UpdateChanges`,
        onSuccess: () => {
          this.pendingCounts = {}
        },
        schedule: '1 minute',
        task: async () => await this.updateChanges(),
      },
      {
        name: `${moduleName}.DivineAddressesBatch`,
        schedule: '5 minute',
        task: async () => await this.divineAddressesBatch(),
      },
    ]
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<SchemaStatsPayload>[]> {
    const query = payloads?.find<SchemaStatsQueryPayload>(isSchemaStatsQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<SchemaStatsPayload>({ schema: SchemaStatsDivinerSchema }).fields({ count }).build())
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    await this.registerWithChangeStream()
    defineJobs(this.jobQueue, this.jobs)
    this.jobQueue.once('ready', async () => await scheduleJobs(this.jobQueue, this.jobs))
    return true
  }

  protected override async stopHandler() {
    await this.changeStream?.close()
    return await super.stopHandler()
  }

  private backgroundDivine = async (): Promise<void> => {
    for (const address of this.addressIterator) {
      try {
        await this.divineAddressFull(address)
      } catch (error) {
        this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
      }
      await delay(this.backgroundDivineIntervalMs)
    }
    this.backgroundDivineTask = undefined
  }

  private divineAddress = async (address: string): Promise<Record<string, number>> => {
    const stats = await this.boundWitnesses.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ address: address })
    })
    const remote = Object.fromEntries(
      Object.entries(stats?.schema?.count || {}).map(([schema, count]) => {
        return [fromDbProperty(schema), count]
      }),
    )
    const local = this.pendingCounts[address] || {}
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

  private divineAddressFull = async (address: string): Promise<Record<string, number>> => {
    const sortStartTime = Date.now()
    const totals: Record<string, number> = {}
    for (let iteration = 0; iteration < this.aggregateMaxIterations; iteration++) {
      const result: PayloadSchemaCountsAggregateResult[] = await this.boundWitnesses.useCollection((collection) => {
        return collection
          .aggregate()
          .sort({ _timestamp: 1 })
          .match({ _timestamp: { $lt: sortStartTime }, addresses: { $in: [address] } })
          .skip(iteration * this.aggregateLimit)
          .limit(this.aggregateLimit)
          .unwind({ path: '$payload_schemas' })
          .group<PayloadSchemaCountsAggregateResult>({ _id: '$payload_schemas', count: { $sum: 1 } })
          .maxTimeMS(this.aggregateTimeoutMs)
          .toArray()
      })
      if (result.length < 1) break
      // Add current counts to total
      result.map((schema) => {
        totals[schema._id] = totals[schema._id] || 0 + schema.count
      })
    }
    await this.storeDivinedResult(address, totals)
    return totals
  }

  private divineAddressesBatch = async () => {
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updating Addresses`)
    const addressSpaceDiviners = await this.upResolver.resolve({ name: [assertEx(TYPES.AddressSpaceDiviner.description)] })
    const addressSpaceDiviner = asDivinerInstance(addressSpaceDiviners.pop(), `${moduleName}.DivineAddressesBatch: Missing AddressSpaceDiviner`)
    const result = (await addressSpaceDiviner.divine()) ?? []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    const additions = this.addressIterator.addValues(addresses)
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Incoming Addresses Total: ${addresses.length} New: ${additions}`)
    if (addresses.length && !this.backgroundDivineTask) this.backgroundDivineTask = this.backgroundDivine()
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updated Addresses`)
  }

  private divineAllAddresses = () => {
    throw Error('Not Implemented')
  }

  private processChange = (change: ChangeStreamInsertDocument<BoundWitnessWithMeta>) => {
    this.resumeAfter = change._id
    const addresses = change.fullDocument.addresses
    const schemas = change.fullDocument.payload_schemas
    if (addresses?.length) {
      for (const address of addresses) {
        for (const schema of schemas) {
          if (!this.pendingCounts[address]) this.pendingCounts[address] = {}
          this.pendingCounts[address][schema] = (this.pendingCounts[address][schema] || 0) + 1
        }
      }
    }
  }

  private registerWithChangeStream = async () => {
    this.logger?.log(`${moduleName}.RegisterWithChangeStream: Registering`)
    const wrapper = MongoClientWrapper.get(this.boundWitnesses.uri, this.boundWitnesses.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, `${moduleName}.RegisterWithChangeStream: Connection failed`)
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.BoundWitnesses)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log(`${moduleName}.RegisterWithChangeStream: Registered`)
  }

  private storeDivinedResult = async (address: string, counts: Record<string, number>) => {
    const sanitizedCounts: Record<string, number> = Object.fromEntries(
      Object.entries(counts).map(([schema, count]) => {
        return [toDbProperty(schema), count]
      }),
    )
    await this.boundWitnesses.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ address }, { $set: { ['schema.count']: sanitizedCounts } }, updateOptions)
    })
    this.pendingCounts[address] = {}
  }

  private updateChanges = async () => {
    this.logger?.log(`${moduleName}.UpdateChanges: Updating`)
    const updates = Object.keys(this.pendingCounts).map((address) => {
      const $inc = Object.keys(this.pendingCounts[address])
        .map((schema) => {
          return { [`schema.count.${toDbProperty(schema)}`]: this.pendingCounts[address][schema] }
        })
        .reduce((prev, curr) => Object.assign(prev, curr), {})
      this.pendingCounts[address] = {}
      return this.boundWitnesses.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ address }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`${moduleName}.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
