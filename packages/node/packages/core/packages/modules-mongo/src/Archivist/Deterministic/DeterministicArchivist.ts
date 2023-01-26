import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account } from '@xyo-network/account'
import { AbstractArchivist, ArchivistConfig } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromisableArray } from '@xyo-network/promise'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'

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

  get(hashes: string[]): PromisableArray<XyoPayload> {
    // TODO: Verify access via query
    // TODO: Remove _fields or create payloads from builder
    return Promise.all(hashes.map((hash) => this.payloads.findOne({ _hash: hash }) as Promise<XyoPayload>))
  }
  async insert(items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    // TODO: Verify access via validation
    const valid = items.map((payload) => PayloadWrapper.parse(payload)).filter((parsed) => parsed.valid)
    // TODO: map to BWs/payloads transactions (group by BW with referenced payload hashes)
    const boundWitnesses = valid
      .filter((payload) => payload.schema === XyoBoundWitnessSchema)
      .map((payload) => BoundWitnessWrapper.parse(payload).boundwitness)
    const payloads: XyoPayload[] = valid.filter((payload) => payload.schema !== XyoBoundWitnessSchema)
    const boundWitnessesResult = await this.boundWitnesses.insertMany(boundWitnesses)
    const payloadsResult = await this.payloads.insertMany(payloads)
    if (!boundWitnessesResult.acknowledged || boundWitnessesResult.insertedCount !== payloads.length)
      throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
    if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloads.length)
      throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
    const storedPayloads = valid.map((valid) => valid.payload)
    const result = await this.bindResult([...storedPayloads])
    return [result[0]]
  }
}
