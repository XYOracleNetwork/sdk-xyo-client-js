import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractArchivist,
  ArchivistConfig,
  ArchivistFindQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistQuery,
} from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
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
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { getBaseMongoSdk } from '../../Mongo'
import { validByType } from './validByType'

export interface MongoDBDeterministicArchivistParams<TConfig extends ArchivistConfig = ArchivistConfig> extends ModuleParams<TConfig> {
  boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  payloads: BaseMongoSdk<XyoPayloadWithMeta>
}

const toBoundWitnessWithMeta = (wrapper: BoundWitnessWrapper, archive: string): XyoBoundWitnessWithMeta => {
  return { ...wrapper.payload, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}
const toPayloadWithMeta = (wrapper: PayloadWrapper, archive: string): XyoPayloadWithMeta => {
  return { ...wrapper.payload, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}

const getArchive = <T extends XyoBoundWitness | BoundWitnessWrapper | XyoQueryBoundWitness | QueryBoundWitnessWrapper>(bw: T): string => {
  return bw.addresses.join('|')
}

export class MongoDBDeterministicArchivist<TConfig extends ArchivistConfig = ArchivistConfig> extends AbstractArchivist {
  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta>

  public constructor(params: MongoDBDeterministicArchivistParams<TConfig>) {
    super(params)
    this.account = params?.account || new Account({ phrase: assertEx(process.env.ACCOUNT_SEED) })
    this.boundWitnesses = params?.boundWitnesses || getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    this.payloads = params?.payloads || getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  }

  static override async create(params?: Partial<MongoDBDeterministicArchivistParams>): Promise<MongoDBDeterministicArchivist> {
    return (await super.create(params)) as MongoDBDeterministicArchivist
  }

  override find(_filter?: PayloadFindFilter): Promise<XyoPayload[]> {
    throw new Error('find method must be called via query')
  }

  get(_items: string[]): Promise<XyoPayload[]> {
    throw new Error('get method must be called via query')
  }

  insert(_items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    throw new Error('insert method must be called via query')
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
        case ArchivistFindQuerySchema: {
          const filter = typedQuery.filter
          const limit = filter?.limit || 1
          assertEx(limit <= 50, 'MongoDBDeterministicArchivist: Find limit must be <= 50')
          const findBWs = filter?.schema === XyoBoundWitnessSchema
          const archive = getArchive(query)
          for (let i = 0; i < limit; i++) {
            const findFilter = { ...typedQuery?.filter, _archive: archive } as PayloadFindFilter & { _archive: string }
            const payload = (await this.find(findFilter)).pop()
            if (payload) resultPayloads.push(payload)
          }
          break
        }
        case ArchivistGetQuerySchema: {
          const payloads = await this.getInternal(wrapper, typedQuery)
          resultPayloads.push(...payloads)
          break
        }
        case ArchivistInsertQuerySchema: {
          const items: XyoPayload[] = [query]
          // TODO: Filter out command?
          if (payloads?.length) items.push(...payloads)
          const succeeded = await this.insertInternal(items)
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

  protected async findBoundWitness(filter: PayloadFindFilter): Promise<XyoBoundWitness | null> {
    const { _archive, order, offset } = filter as PayloadFindFilter & { _archive: string }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'desc' ? Date.now() : 0
    const _timestamp = order === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    const find: Filter<XyoBoundWitnessWithMeta> = { _archive, _timestamp }
    const result = await (await this.boundWitnesses.find(find)).limit(1).sort(sort).toArray()
    const bw = result.pop() as XyoBoundWitness
    return bw ? bw : null
  }

  protected async findInternal(filter?: PayloadFindFilter): Promise<XyoPayload[]> {
    const { _archive, schema, order, offset } = filter as PayloadFindFilter & { _archive: string }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const result = await (await this.payloads.find({ _archive, schema })).limit(1).sort(sort).toArray()
    const payload = result.pop() as XyoPayload
    return payload ? [payload] : []
  }

  protected async findPayload(filter: PayloadFindFilter) {
    const { _archive, order, offset, schema } = filter as PayloadFindFilter & { _archive: string }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'desc' ? Date.now() : 0
    const _timestamp = order === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    const find: Filter<XyoPayloadWithMeta> = { _archive, _timestamp }
    if (schema) find.schema = schema
    const result = await (await this.payloads.find(find)).limit(1).sort(sort).toArray()
    const payload = result.pop() as XyoPayload
    return payload ? payload : null
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<XyoPayload[]> {
    const archive = getArchive(wrapper)
    const hashes = typedQuery.hashes
    // TODO: Filter out command?
    const gets = await Promise.all(hashes.map((hash) => this.payloads.findOne({ _archive: archive, _hash: hash })))
    return gets.filter(exists)
  }

  protected async insertInternal(items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    const [wrappedBoundWitnesses, wrappedPayloads] = items.reduce(validByType, [[], []])
    const validPayloads = wrappedPayloads.map((wrapped) => wrapped.payload)
    const wrappedBoundWitnessesWithPayloads = wrappedBoundWitnesses.map((wrapped) => {
      wrapped.payloads = validPayloads
      return wrapped
    })
    const insertions = await Promise.allSettled(
      wrappedBoundWitnessesWithPayloads.map(async (wrappedBoundWitness) => {
        const archive = getArchive(wrappedBoundWitness)
        const bw = toBoundWitnessWithMeta(wrappedBoundWitness, archive)
        const bwResult = await this.boundWitnesses.insertOne(bw)
        if (!bwResult.acknowledged || !bwResult.insertedId) throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
        const payloads = wrappedBoundWitness.payloadsArray.map((p) => toPayloadWithMeta(p, archive))
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
}
