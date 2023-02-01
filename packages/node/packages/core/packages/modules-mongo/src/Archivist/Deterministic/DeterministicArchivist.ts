import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractArchivist,
  ArchivistConfig,
  ArchivistFindQuery,
  ArchivistFindQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
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
import { DefaultMaxTimeMS } from '../../defaults'
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
  return assertEx(bw.addresses.join('|'), 'missing addresses for query')
}

type BoundWitnessesFilter = Filter<XyoBoundWitnessWithMeta>
type PayloadsFilter = Filter<XyoPayloadWithMeta>

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
          resultPayloads.push(...(await this.findInternal(wrapper, typedQuery)))
          break
        }
        case ArchivistGetQuerySchema: {
          resultPayloads.push(...(await this.getInternal(wrapper, typedQuery)))
          break
        }
        case ArchivistInsertQuerySchema: {
          resultPayloads.push(...(await this.insertInternal(wrapper, typedQuery)))
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

  protected async findBoundWitness(
    filter: BoundWitnessesFilter,
    sort: { [key: string]: SortDirection } = { _timestamp: -1 },
  ): Promise<XyoBoundWitnessWithMeta | undefined> {
    return (await (await this.boundWitnesses.find(filter)).sort(sort).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
  }

  protected async findInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistFindQuery): Promise<XyoPayload[]> {
    const { schema, limit, order, offset } = Object.assign({ limit: 1, order: 'desc' }, typedQuery?.filter || {})
    assertEx(limit > 0, 'MongoDBDeterministicArchivist: Find limit must be > 0')
    assertEx(limit <= 50, 'MongoDBDeterministicArchivist: Find limit must be <= 50')
    assertEx(order === 'desc', 'MongoDBDeterministicArchivist: Find order only supports descending')
    const archive = getArchive(wrapper)
    // TODO: Only use hash as offset assert not timestamp
    const hash = offset ? `${offset}` : (await this.findBoundWitness({ _archive: archive }))?._hash
    assertEx(hash, 'Missing hash')
    // TODO: Sort ascending by finding BW where previous hash === current hash
    const before = order === 'asc'
    const resultPayloads: (XyoBoundWitnessWithMeta | XyoPayloadWithMeta)[] = []
    const address = assertEx(wrapper.addresses[0], 'Find query requires at least one address')
    const findBWs = !schema || schema === XyoBoundWitnessSchema
    const findPayloads = !schema || schema !== XyoBoundWitnessSchema
    let nextHash = hash
    for (let i = 0; i < limit; i++) {
      // TODO: Handle payloads (sequenced by BW) filtered by schema
      const bwFilter: BoundWitnessesFilter = { _archive: archive, _hash: hash }
      if (nextHash) bwFilter._hash = nextHash
      // TODO: Handle schema/multiple schemas?
      const block = await this.findNextBoundWitness(bwFilter, before)
      if (!block) break
      if (findBWs) {
        resultPayloads.push(block)
      }
      if (findPayloads) {
        const { payload_hashes } = block
        const payloads = await Promise.all(
          payload_hashes.map(async (hash) => {
            const payloadFilter: PayloadsFilter = { _hash: hash }
            // TODO: Handle schema/multiple schemas?
            if (schema) payloadFilter.schema = schema
            return (await (await this.payloads.find(payloadFilter)).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
          }),
        )
        // TODO: Only push desired limit amount or break
        resultPayloads.push(...payloads.filter(exists))
      }
      const addressIndex = block.addresses.findIndex((value) => value === address)
      const previousHash = block.previous_hashes[addressIndex]
      if (!previousHash) break
      nextHash = previousHash
    }
    return resultPayloads
  }

  protected async findNextBoundWitness(filter: BoundWitnessesFilter, before = true): Promise<XyoBoundWitnessWithMeta | undefined> {
    const sort: { [key: string]: SortDirection } = before ? { _timestamp: -1 } : { _timestamp: 1 }
    return (await (await this.boundWitnesses.find(filter)).sort(sort).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
  }

  protected async findPayload(filter: PayloadFindFilter) {
    const { _archive, order, offset, schema } = filter as PayloadFindFilter & { _archive: string }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'desc' ? Date.now() : 0
    const _timestamp = order === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    const find: PayloadsFilter = { _archive, _timestamp }
    if (schema) find.schema = schema
    const result = await (await this.payloads.find(find)).limit(1).sort(sort).toArray()
    const payload = result.pop() as XyoPayload
    return payload ? payload : null
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<XyoPayload[]> {
    const archive = getArchive(wrapper)
    const hashes = typedQuery.hashes
    const gets = await Promise.all(hashes.map((hash) => this.payloads.findOne({ _archive: archive, _hash: hash })))
    return gets.filter(exists)
  }

  protected async insertInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, _typedQuery: ArchivistInsertQuery): Promise<XyoBoundWitness[]> {
    const items: XyoPayload[] = [wrapper.boundwitness]
    if (wrapper.payloadsArray?.length) items.push(...wrapper.payloadsArray)
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
    const results = await Promise.all(succeeded.map((success) => success.boundwitness))
    return results
  }
}
