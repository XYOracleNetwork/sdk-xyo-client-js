import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, AddressSpaceDiviner, DivinerConfig, DivinerParams, DivinerWrapper } from '@xyo-network/diviner'
import { AnyConfigSchema } from '@xyo-network/module'
import {
  isPayloadStatsQueryPayload,
  PayloadStatsDiviner,
  PayloadStatsPayload,
  PayloadStatsQueryPayload,
  PayloadStatsSchema,
  PayloadWithMeta,
} from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk, MongoClientWrapper } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import { ChangeStream, ChangeStreamInsertDocument, ChangeStreamOptions, ResumeToken, UpdateOptions } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DATABASES } from '../../databases'
import { SetIterator } from '../../Util'

const updateOptions: UpdateOptions = { upsert: true }

interface Stats {
  archive: string
  payloads?: {
    count?: number
  }
}

export type MongoDBPayloadStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.payload'
export const MongoDBPayloadStatsDivinerConfigSchema: MongoDBPayloadStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.payload'

export type MongoDBPayloadStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  WithAdditional<
    Payload,
    T & {
      schema: MongoDBPayloadStatsDivinerConfigSchema
    }
  >
>

export type MongoDBPayloadStatsDivinerParams<T extends Payload = Payload> = DivinerParams<
  AnyConfigSchema<MongoDBPayloadStatsDivinerConfig<T>>,
  {
    addressSpaceDiviner: AddressSpaceDiviner
    payloadSdk: BaseMongoSdk<PayloadWithMeta>
  }
>

const moduleName = 'MongoDBPayloadStatsDiviner'

export class MongoDBPayloadStatsDiviner<TParams extends MongoDBPayloadStatsDivinerParams = MongoDBPayloadStatsDivinerParams>
  extends AbstractDiviner<TParams>
  implements PayloadStatsDiviner, JobProvider
{
  static override configSchema = MongoDBPayloadStatsDivinerConfigSchema

  /**
   * Iterates over know addresses obtained from AddressDiviner
   */
  protected readonly addressIterator: SetIterator<string> = new SetIterator([])

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

  async divine(payloads?: Payload[]): Promise<Payload<PayloadStatsPayload>[]> {
    const query = payloads?.find<PayloadStatsQueryPayload>(isPayloadStatsQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) => new PayloadBuilder<PayloadStatsPayload>({ schema: PayloadStatsSchema }).fields({ count }).build())
  }

  override async start() {
    await super.start()
    await this.registerWithChangeStream()
  }

  protected override async stop(): Promise<this> {
    await this.changeStream?.close()
    return await super.stop()
  }

  private backgroundDivine = async (batchSize = 1000): Promise<void> => {
    for (let i = 0; i < batchSize; i++) {
      try {
        const next = this.addressIterator.next()
        if (next?.done) break
        if (!next?.value) continue
        const address = next.value
        await this.divineAddressFull(address)
      } catch (error) {
        this.logger?.error(`${moduleName}.BackgroundDivine: ${error}`)
      }
      await delay(50)
    }
  }

  private divineAddress = async (address: string) => {
    const stats = await this.params.payloadSdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ archive: address })
    })
    const remote = stats?.payloads?.count || 0
    const local = this.pendingCounts[address] || 0
    return remote + local
  }

  private divineAddressFull = async (address: string) => {
    const count = await this.params.payloadSdk.useCollection((collection) => collection.countDocuments({ _archive: address }))
    await this.storeDivinedResult(address, count)
    return count
  }

  private divineAddressesBatch = async () => {
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updating Addresses`)
    const addressSpaceDiviner = assertEx(this.params.addressSpaceDiviner, `${moduleName}.DivineAddressesBatch: Missing AddressSpaceDiviner`)
    const result = (await new DivinerWrapper({ module: addressSpaceDiviner }).divine([])) || []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    const additions = this.addressIterator.addValues(addresses)
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Incoming Addresses Total: ${addresses.length} New: ${additions}`)
    await this.backgroundDivine()
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updated Addresses`)
  }

  private divineAllAddresses = () => this.params.payloadSdk.useCollection((collection) => collection.estimatedDocumentCount())

  private processChange = (change: ChangeStreamInsertDocument<PayloadWithMeta>) => {
    this.resumeAfter = change._id
    const address = change.fullDocument._archive
    if (address) this.pendingCounts[address] = (this.pendingCounts[address] || 0) + 1
  }

  private registerWithChangeStream = async () => {
    this.logger?.log(`${moduleName}.RegisterWithChangeStream: Registering`)
    const wrapper = MongoClientWrapper.get(this.params.payloadSdk.uri, this.params.payloadSdk.config.maxPoolSize)
    const connection = await wrapper.connect()
    assertEx(connection, `${moduleName}.RegisterWithChangeStream: Connection failed`)
    const collection = connection.db(DATABASES.Archivist).collection(COLLECTIONS.Payloads)
    const opts: ChangeStreamOptions = this.resumeAfter ? { resumeAfter: this.resumeAfter } : {}
    this.changeStream = collection.watch([], opts)
    this.changeStream.on('change', this.processChange)
    this.changeStream.on('error', this.registerWithChangeStream)
    this.logger?.log(`${moduleName}.RegisterWithChangeStream: Registered`)
  }

  private storeDivinedResult = async (address: string, count: number) => {
    await this.params.payloadSdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ archive: address }, { $set: { [`${COLLECTIONS.Payloads}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[address] = 0
  }

  private updateChanges = async () => {
    this.logger?.log(`${moduleName}.UpdateChanges: Updating`)
    const updates = Object.keys(this.pendingCounts).map((address) => {
      const count = this.pendingCounts[address]
      this.pendingCounts[address] = 0
      const $inc = { [`${COLLECTIONS.Payloads}.count`]: count }
      return this.params.payloadSdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ archive: address }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`${moduleName}.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
