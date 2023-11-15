import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { PayloadStatsDiviner } from '@xyo-network/diviner-payload-stats-abstract'
import {
  isPayloadStatsQueryPayload,
  PayloadStatsDivinerConfigSchema,
  PayloadStatsDivinerSchema,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
} from '@xyo-network/diviner-payload-stats-model'
import { COLLECTIONS, DATABASES, MongoDBModuleMixin } from '@xyo-network/module-abstract-mongodb'
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

interface Stats {
  address: string
  payloads?: {
    count?: number
  }
}

const MongoDBDivinerBase = MongoDBModuleMixin(PayloadStatsDiviner)

const moduleName = 'MongoDBPayloadStatsDiviner'

export class MongoDBPayloadStatsDiviner extends MongoDBDivinerBase implements PayloadStatsDiviner, JobProvider {
  static override configSchemas = [PayloadStatsDivinerConfigSchema]

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

  protected changeStream: ChangeStream | undefined = undefined
  protected pendingCounts: Record<string, number> = {}
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

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<PayloadStatsPayload>[]> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsDivinerSchema }).fields({ count }).build())
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

  private divineAddress = async (address: string) => {
    const stats = await this.payloads.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ address: address })
    })
    const remote = stats?.payloads?.count || 0
    const local = this.pendingCounts[address] || 0
    return remote + local
  }

  private divineAddressFull = async (address: string) => {
    let total = 0
    for (let iteration = 0; iteration < this.aggregateMaxIterations; iteration++) {
      const count = await this.boundWitnesses.useCollection((collection) => {
        return collection
          .aggregate<{ payload_hashes: number }>([
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            { $sort: { addresses: 1, _timestamp: -1 } },
            // Find all BoundWitnesses containing this address
            { $match: { addresses: { $in: [address] } } },
            // In batches
            { $skip: iteration * this.aggregateLimit },
            { $limit: this.aggregateLimit },
            // Flatten the payload_hashes to individual documents
            { $unwind: { path: '$payload_hashes' } },
            // Count all the payload hashes witnessed for this address
            { $count: 'payload_hashes' },
          ])
          .maxTimeMS(this.aggregateTimeoutMs)
          .next()
      })
      if (count != null) {
        total += count.payload_hashes
        continue
      }
      break
    }
    await this.storeDivinedResult(address, total)
    return total
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

  private divineAllAddresses = () => this.payloads.useCollection((collection) => collection.estimatedDocumentCount())

  private processChange = (change: ChangeStreamInsertDocument<BoundWitnessWithMeta>) => {
    this.resumeAfter = change._id
    const addresses = change.fullDocument.addresses
    const count = change.fullDocument?.payload_hashes?.length || 0
    if (addresses?.length && count) {
      for (const address of addresses) {
        if (address) this.pendingCounts[address] = (this.pendingCounts[address] || 0) + count
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

  private storeDivinedResult = async (address: string, count: number) => {
    await this.payloads.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ address }, { $set: { [`${COLLECTIONS.Payloads}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[address] = 0
  }

  private updateChanges = async () => {
    this.logger?.log(`${moduleName}.UpdateChanges: Updating`)
    const updates = Object.keys(this.pendingCounts).map((address) => {
      const count = this.pendingCounts[address]
      this.pendingCounts[address] = 0
      const $inc = { [`${COLLECTIONS.Payloads}.count`]: count }
      return this.payloads.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ address }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`${moduleName}.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
