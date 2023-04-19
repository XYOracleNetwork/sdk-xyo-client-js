import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { fulfilled, rejected } from '@xylabs/promise'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { WithAdditional } from '@xyo-network/core'
import { AbstractDiviner, DivinerConfig, DivinerWrapper } from '@xyo-network/diviner'
import { AnyConfigSchema, ModuleParams } from '@xyo-network/module'
import {
  BoundWitnessStatsDiviner,
  BoundWitnessStatsDivinerConfigSchema,
  BoundWitnessStatsDivinerPayload,
  BoundWitnessStatsDivinerQueryPayload,
  BoundWitnessStatsDivinerSchema,
  BoundWitnessWithMeta,
  isBoundWitnessStatsDivinerQueryPayload,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
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
  address: string
  bound_witnesses?: {
    count?: number
  }
}

export type MongoDBBoundWitnessStatsDivinerConfigSchema = 'network.xyo.module.config.diviner.stats.boundwitness'
export const MongoDBBoundWitnessStatsDivinerConfigSchema: MongoDBBoundWitnessStatsDivinerConfigSchema =
  'network.xyo.module.config.diviner.stats.boundwitness'

export type MongoDBBoundWitnessStatsDivinerConfig<T extends Payload = Payload> = DivinerConfig<
  WithAdditional<
    Payload,
    T & {
      schema: MongoDBBoundWitnessStatsDivinerConfigSchema
    }
  >
>
export type MongoDBBoundWitnessStatsDivinerParams<T extends Payload = Payload> = ModuleParams<
  AnyConfigSchema<MongoDBBoundWitnessStatsDivinerConfig<T>>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
  }
>

const moduleName = 'MongoDBBoundWitnessStatsDiviner'

export class MongoDBBoundWitnessStatsDiviner<TParams extends MongoDBBoundWitnessStatsDivinerParams = MongoDBBoundWitnessStatsDivinerParams>
  extends AbstractDiviner<TParams>
  implements BoundWitnessStatsDiviner, JobProvider
{
  static override configSchema = BoundWitnessStatsDivinerConfigSchema

  /**
   * Iterates over know addresses obtained from AddressDiviner
   */
  protected readonly addressIterator: SetIterator<string> = new SetIterator([])

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

  override async divine(payloads?: Payload[]): Promise<Payload<BoundWitnessStatsDivinerPayload>[]> {
    const query = payloads?.find<BoundWitnessStatsDivinerQueryPayload>(isBoundWitnessStatsDivinerQueryPayload)
    const addresses = query?.address ? (Array.isArray(query?.address) ? query.address : [query.address]) : undefined
    const counts = addresses ? await Promise.all(addresses.map((address) => this.divineAddress(address))) : [await this.divineAllAddresses()]
    return counts.map((count) =>
      new PayloadBuilder<BoundWitnessStatsDivinerPayload>({ schema: BoundWitnessStatsDivinerSchema }).fields({ count }).build(),
    )
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
    const stats = await this.params.boundWitnessSdk.useMongo(async (mongo) => {
      return await mongo.db(DATABASES.Archivist).collection<Stats>(COLLECTIONS.ArchivistStats).findOne({ address: address })
    })
    const remote = stats?.bound_witnesses?.count || 0
    const local = this.pendingCounts[address] || 0
    return remote + local
  }

  private divineAddressFull = async (address: string) => {
    const count = await this.params.boundWitnessSdk.useCollection((collection) => collection.countDocuments({ addresses: { $in: [address] } }))
    await this.storeDivinedResult(address, count)
    return count
  }

  private divineAddressesBatch = async () => {
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updating Addresses`)
    const addressSpaceDiviners = await this.upResolver.resolve({ name: [assertEx(TYPES.AddressSpaceDiviner.description)] })
    const addressSpaceDiviner = assertEx(addressSpaceDiviners.pop(), `${moduleName}.DivineAddressesBatch: Missing AddressSpaceDiviner`)
    const result = (await DivinerWrapper.wrap(addressSpaceDiviner, this.account).divine([])) || []
    const addresses = result.filter<AddressPayload>((x): x is AddressPayload => x.schema === AddressSchema).map((x) => x.address)
    const additions = this.addressIterator.addValues(addresses)
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Incoming Addresses Total: ${addresses.length} New: ${additions}`)
    if (addresses.length && !this.backgroundDivineTask) this.backgroundDivineTask = this.backgroundDivine()
    this.logger?.log(`${moduleName}.DivineAddressesBatch: Updated Addresses`)
  }

  private divineAllAddresses = () => this.params.boundWitnessSdk.useCollection((collection) => collection.estimatedDocumentCount())

  private processChange = (change: ChangeStreamInsertDocument<BoundWitnessWithMeta>) => {
    this.resumeAfter = change._id
    const addresses = change?.fullDocument?.addresses
    for (const address of addresses) {
      if (address) this.pendingCounts[address] = (this.pendingCounts[address] || 0) + 1
    }
  }

  private registerWithChangeStream = async () => {
    this.logger?.log(`${moduleName}.RegisterWithChangeStream: Registering`)
    const wrapper = MongoClientWrapper.get(this.params.boundWitnessSdk.uri, this.params.boundWitnessSdk.config.maxPoolSize)
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
    await this.params.boundWitnessSdk.useMongo(async (mongo) => {
      await mongo
        .db(DATABASES.Archivist)
        .collection(COLLECTIONS.ArchivistStats)
        .updateOne({ address }, { $set: { [`${COLLECTIONS.BoundWitnesses}.count`]: count } }, updateOptions)
    })
    this.pendingCounts[address] = 0
  }

  private updateChanges = async () => {
    this.logger?.log(`${moduleName}.UpdateChanges: Updating`)
    const updates = Object.keys(this.pendingCounts).map((address) => {
      const count = this.pendingCounts[address]
      this.pendingCounts[address] = 0
      const $inc = { [`${COLLECTIONS.BoundWitnesses}.count`]: count }
      return this.params.boundWitnessSdk.useMongo(async (mongo) => {
        await mongo.db(DATABASES.Archivist).collection(COLLECTIONS.ArchivistStats).updateOne({ address }, { $inc }, updateOptions)
      })
    })
    const results = await Promise.allSettled(updates)
    const succeeded = results.filter(fulfilled).length
    const failed = results.filter(rejected).length
    this.logger?.log(`${moduleName}.UpdateChanges: Updated - Succeeded: ${succeeded} Failed: ${failed}`)
  }
}
