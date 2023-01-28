import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractArchivist,
  ArchivistConfig,
  ArchivistFindQuerySchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistQuery,
} from '@xyo-network/archivist'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AbstractModuleConfig,
  ModuleParams,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoBoundWitnessWithMeta, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { validByType } from './validByType'

export interface MongoDBDeterministicArchivistParams<TConfig extends ArchivistConfig = ArchivistConfig> extends ModuleParams<TConfig> {
  boundWitnesses: BaseMongoSdk<XyoBoundWitness>
  payloads: BaseMongoSdk<XyoPayload>
}

const toBoundWitnessWithMeta = (wrapper: BoundWitnessWrapper): XyoBoundWitnessWithMeta => {
  return { ...wrapper.payload, _archive: wrapper.hash, _hash: wrapper.hash, _timestamp: Date.now() }
}
const toPayloadWithMeta = (wrapper: PayloadWrapper): XyoPayloadWithMeta => {
  return { ...wrapper.payload, _archive: wrapper.hash, _hash: wrapper.hash, _timestamp: Date.now() }
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

  get(hashes: string[]): Promise<XyoPayload[]> {
    // TODO: Verify access via query
    // TODO: Remove _fields or create payloads from builder
    return Promise.all(hashes.map((hash) => this.payloads.findOne({ _hash: hash }) as Promise<XyoPayload>))
  }
  async insert(items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    const [wrappedBoundWitnesses, wrappedPayloads] = items.reduce(validByType, [[], []])
    const validPayloads = wrappedPayloads.map((wrapped) => wrapped.payload)
    const wrappedBoundWitnessesWithPayloads = wrappedBoundWitnesses.map((wrapped) => {
      wrapped.payloads = validPayloads
      return wrapped
    })
    const insertions = await Promise.allSettled(
      wrappedBoundWitnessesWithPayloads.map(async (wrappedBoundWitness) => {
        const bw = toBoundWitnessWithMeta(wrappedBoundWitness.boundwitness)
        const bwResult = await this.boundWitnesses.insertOne(bw)
        if (!bwResult.acknowledged || !bwResult.insertedId) throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
        const payloads = wrappedBoundWitness.payloadsArray.map(toPayloadWithMeta)
        const payloadsResult = await this.payloads.insertMany(payloads)
        if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloads.length)
          throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
        return wrappedBoundWitness
      }),
    )
    const succeeded = insertions.filter(fulfilled).map((v) => v.value)
    const results = await Promise.all(
      succeeded.map(async (success) => {
        const bw = success.boundwitness
        const payloads = success.payloadsArray.map((p) => p.payload)
        return (await this.bindResult([bw, ...payloads]))[0]
      }),
    )
    return results
  }

  override queries() {
    return [ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends AbstractModuleConfig = AbstractModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: XyoPayload[] = []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case ArchivistGetQuerySchema: {
          const items: XyoPayload[] = [query]
          // TODO: Filter out command?
          if (payloads?.length) items.push(...payloads)
          const succeeded = await this.get(items)
          resultPayloads.push(...succeeded)
          break
        }
        case ArchivistInsertQuerySchema: {
          const items: XyoPayload[] = [query]
          // TODO: Filter out command?
          if (payloads?.length) items.push(...payloads)
          const succeeded = await this.insert(items)
          resultPayloads.push(...succeeded)
          break
        }
        default:
          return super.query(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return this.bindResult(resultPayloads, queryAccount)
  }
}
