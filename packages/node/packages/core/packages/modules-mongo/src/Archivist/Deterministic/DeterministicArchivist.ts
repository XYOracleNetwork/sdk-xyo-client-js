import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { AbstractArchivist, ArchivistConfig } from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PromisableArray } from '@xyo-network/promise'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { validByType } from './validByType'

export interface MongoDBDeterministicArchivistParams<TConfig extends ArchivistConfig = ArchivistConfig> extends ModuleParams<TConfig> {
  boundWitnesses: BaseMongoSdk<XyoBoundWitness>
  payloads: BaseMongoSdk<XyoPayload>
}

export class MongoDBDeterministicArchivist<TConfig extends ArchivistConfig = ArchivistConfig> extends AbstractArchivist {
  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitness>
  protected readonly payloads: BaseMongoSdk<XyoPayload>

  public constructor(params: MongoDBDeterministicArchivistParams<TConfig>) {
    super(params)
    this.account = params?.account || new Account({ phrase: assertEx(process.env.ACCOUNT_SEED) })
    this.boundWitnesses = params?.boundWitnesses || getBaseMongoSdk<XyoBoundWitness>(COLLECTIONS.BoundWitnesses)
    this.payloads = params?.payloads || getBaseMongoSdk<XyoPayload>(COLLECTIONS.Payloads)
  }

  static override async create(params?: Partial<MongoDBDeterministicArchivistParams>): Promise<MongoDBDeterministicArchivist> {
    return (await super.create(params)) as MongoDBDeterministicArchivist
  }

  // TODO: Find

  get(hashes: string[]): PromisableArray<XyoPayload> {
    // TODO: Verify access via query
    // TODO: Remove _fields or create payloads from builder
    return Promise.all(hashes.map((hash) => this.payloads.findOne({ _hash: hash }) as Promise<XyoPayload>))
  }
  async insert(items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    // TODO: Verify access via validation
    const [wrappedBoundWitnesses, wrappedPayloads] = items.reduce(validByType, [[], []])
    const payloads = wrappedPayloads.map((wrapped) => wrapped.payload)
    const boundWitnesses = wrappedBoundWitnesses.map((wrapped) => {
      wrapped.payloads = payloads
      return wrapped
    })
    const insertions = await Promise.allSettled(
      boundWitnesses.map(async (bw) => {
        const bwResult = await this.boundWitnesses.insertOne(bw.boundwitness)
        if (!bwResult.acknowledged || !bwResult.insertedId) throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
        const payloadsResult = await this.payloads.insertMany(bw.payloadsArray)
        if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloads.length)
          throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
        return bw
      }),
    )
    const succeeded = insertions.filter(fulfilled).map((x) => x.value)
    const result = await this.bindResult(succeeded.map((success) => success.boundwitness))
    return [result[0]]
  }
}
