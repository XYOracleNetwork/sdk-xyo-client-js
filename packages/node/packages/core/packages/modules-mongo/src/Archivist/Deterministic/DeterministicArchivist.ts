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
  const { addresses } = bw
  return assertEx([...addresses].sort().join('|'), 'missing addresses for query')
}

const getFilter = (wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistFindQuery): [BoundWitnessesFilter, PayloadsFilter] => {
  const bwFilter: BoundWitnessesFilter = {}
  const payloadFilter: PayloadsFilter = {}
  let offset: string | undefined
  if (typedQuery?.filter?.offset) {
    assertEx(typeof typedQuery?.filter?.offset === 'string', 'MongoDBDeterministicArchivist: Find offset only supports string hash')
    offset = typedQuery?.filter?.offset as string
    bwFilter._hash = offset
  }
  let schema: string[] | undefined = undefined
  if (typedQuery?.filter?.schema) {
    schema = Array.isArray(typedQuery?.filter?.schema) ? typedQuery?.filter?.schema : [typedQuery?.filter?.schema]
    bwFilter.payload_schemas = { $in: schema }
    payloadFilter.schema = { $in: schema }
  }
  assertEx(wrapper.addresses.length, 'Find query requires at least one address')
  bwFilter.addresses = { $all: wrapper.addresses }
  const archive = getArchive(wrapper)
  // TODO: Add archive filter?
  return [bwFilter, payloadFilter]
}

type BoundWitnessesFilter = Filter<XyoBoundWitnessWithMeta>
type PayloadsFilter = Filter<XyoPayloadWithMeta>

const searchDepthLimit = 50

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
    // TODO: Use new Account once we mock Account.new in Jest
    const queryAccount = Account.random()
    // const queryAccount = new Account()
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
    const { limit, order } = Object.assign({ limit: 1, order: 'desc' }, typedQuery?.filter || {})
    assertEx(limit > 0, 'MongoDBDeterministicArchivist: Find limit must be > 0')
    assertEx(limit <= 50, 'MongoDBDeterministicArchivist: Find limit must be <= 50')
    const [bwFilter, payloadFilter] = getFilter(wrapper, typedQuery)
    const resultPayloads: (XyoBoundWitnessWithMeta | XyoPayloadWithMeta)[] = []
    const findBWs = true
    const findPayloads = true
    // const findBWs = !filter?.schema || filter?.schema === XyoBoundWitnessSchema
    // const findPayloads = !filter?.schema || filter?.schema !== XyoBoundWitnessSchema
    let currentBw: XyoBoundWitnessWithMeta | undefined
    let nextHash: string | null | undefined = `${typedQuery?.filter?.offset}`
    if (!nextHash) return []
    searchLoop: for (let i = 0; i < searchDepthLimit; i++) {
      // TODO: Handle payloads (sequenced by BW) filtered by schema
      if (nextHash) bwFilter._hash = nextHash
      // TODO: Handle schema/multiple schemas?
      currentBw = await this.findBoundWitness(bwFilter)
      if (!currentBw) break
      if (findBWs) resultPayloads.push(currentBw)
      if (findPayloads) {
        const payloads = (await Promise.all(currentBw.payload_hashes.map((hash) => this.findPayload({ _hash: hash })))).filter(exists)
        for (let p = 0; p < payloads.length; p++) {
          if (resultPayloads.length >= limit) break searchLoop
          resultPayloads.push(payloads[p])
        }
      }
    }
    nextHash = currentBw?.previous_hashes?.reduce((prev, curr) => (curr ? curr : prev), null)
    return resultPayloads.map((p) => PayloadWrapper.parse(p).body)
  }

  protected async findNextBoundWitness(filter: BoundWitnessesFilter, before = true): Promise<XyoBoundWitnessWithMeta | undefined> {
    const sort: { [key: string]: SortDirection } = before ? { _timestamp: -1 } : { _timestamp: 1 }
    // TODO: if before find previous hash
    // TODO: if after find BW where this hash === previous hash
    return (await (await this.boundWitnesses.find(filter)).sort(sort).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
  }

  protected async findPayload(filter: PayloadsFilter): Promise<XyoPayloadWithMeta | undefined> {
    const { _archive, order, offset, schema } = filter as PayloadFindFilter & { _archive: string }
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'desc' ? Date.now() : 0
    const _timestamp = order === 'desc' ? { $lt: parsedTimestamp } : { $gt: parsedTimestamp }
    const find: PayloadsFilter = { _archive, _timestamp }
    if (schema) find.schema = schema
    const result = await (await this.payloads.find(find)).limit(1).sort(sort).toArray()
    return result.pop()
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<XyoPayload[]> {
    const archive = getArchive(wrapper)
    const hashes = typedQuery.hashes
    const gets = await Promise.all(hashes.map((hash) => this.payloads.findOne({ _archive: archive, _hash: hash })))
    return gets.filter(exists).map((p) => PayloadWrapper.parse(p).body)
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
    return results.map((result) => BoundWitnessWrapper.parse(result).body)
  }
}
