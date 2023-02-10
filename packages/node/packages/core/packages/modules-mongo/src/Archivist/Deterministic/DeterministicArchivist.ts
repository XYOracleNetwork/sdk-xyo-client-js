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
import { SortDirection } from 'mongodb'

import { COLLECTIONS } from '../../collections'
import { DefaultMaxTimeMS } from '../../defaults'
import { getBaseMongoSdk } from '../../Mongo'
import {
  BoundWitnessesFilter,
  getArchive,
  getFilter,
  getLimit,
  getPayloadSchemas,
  PayloadsFilter,
  shouldFindBoundWitnesses,
  shouldFindPayloads,
} from './QueryHelpers'
import { validByType } from './validByType'

export interface MongoDBDeterministicArchivistParams<TConfig extends ArchivistConfig = ArchivistConfig> extends ModuleParams<TConfig> {
  boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  payloads: BaseMongoSdk<XyoPayloadWithMeta>
}

const toBoundWitnessWithMeta = (wrapper: BoundWitnessWrapper | QueryBoundWitnessWrapper, archive: string): XyoBoundWitnessWithMeta => {
  const bw = wrapper.boundwitness as XyoBoundWitness
  return { ...bw, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}

const isBoundWitness = (wrapper: PayloadWrapper) => wrapper.schema.startsWith(XyoBoundWitnessSchema)
const isNotBoundWitness = (wrapper: PayloadWrapper) => !wrapper.schema.startsWith(XyoBoundWitnessSchema)

const toPayloadWithMeta = (wrapper: PayloadWrapper, archive: string): XyoPayloadWithMeta => {
  return { ...wrapper.payload, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}

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
    const limit = getLimit(typedQuery)
    const [bwFilter, payloadFilter] = getFilter(wrapper, typedQuery)
    const resultPayloads: (XyoBoundWitnessWithMeta | XyoPayloadWithMeta)[] = []
    const findBWs = shouldFindBoundWitnesses(typedQuery)
    const findPayloads = shouldFindPayloads(typedQuery)
    const payloadSchemas = getPayloadSchemas(typedQuery)
    let currentBw: XyoBoundWitnessWithMeta | undefined
    let nextHash: string | null | undefined = undefined
    for (let searchDepth = 0; searchDepth < searchDepthLimit; searchDepth++) {
      if (resultPayloads.length >= limit) break
      currentBw = await this.findBoundWitness(bwFilter)
      if (!currentBw) break
      if (findBWs) resultPayloads.push(currentBw)
      if (findPayloads) {
        const _archive = getArchive(currentBw)
        const payloadHashes = payloadSchemas.length
          ? currentBw?.payload_schemas.reduce((schemas, schema, idx) => {
              if (payloadSchemas.includes(schema) && currentBw?.payload_hashes[idx]) schemas.push(currentBw.payload_hashes[idx])
              return schemas
            }, [] as string[])
          : currentBw.payload_hashes
        const payloads = (
          await Promise.all(
            payloadHashes.map((_hash) => {
              const schema = currentBw?.payload_schemas[currentBw.payload_hashes.indexOf(_hash)]
              return schema?.startsWith(XyoBoundWitnessSchema)
                ? this.findBoundWitness({ _archive, _hash })
                : this.findPayload({ ...payloadFilter, _archive, _hash })
            }),
          )
        ).filter(exists)
        for (let p = 0; p < payloads.length; p++) {
          if (resultPayloads.length >= limit) break
          resultPayloads.push(payloads[p])
        }
      }
      nextHash = currentBw?.previous_hashes?.at(-1)
      if (!nextHash) break
      bwFilter._hash = nextHash
    }
    // TODO: Ensure this is omitting _id
    return resultPayloads.map((p) => PayloadWrapper.parse(p).body)
  }

  protected async findPayload(filter: PayloadsFilter): Promise<XyoPayloadWithMeta | undefined> {
    const { _archive, order, offset, schema, _hash } = filter as PayloadFindFilter & PayloadsFilter
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'asc' ? 0 : Date.now()
    const _timestamp = order === 'asc' ? { $gte: parsedTimestamp } : { $lte: parsedTimestamp }
    const find: PayloadsFilter = { _archive, _timestamp }
    if (schema) find.schema = schema
    if (_hash) find._hash = _hash
    const result = await (await this.payloads.find(find)).limit(1).sort(sort).maxTimeMS(DefaultMaxTimeMS).toArray()
    return result.pop()
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<XyoPayload[]> {
    const _archive = getArchive(wrapper)
    const hashes = typedQuery.hashes
    const gets = await Promise.all(
      [
        hashes.map((_hash) => this.payloads.findOne({ _archive, _hash })),
        hashes.map((_hash) => this.boundWitnesses.findOne({ _archive, _hash })),
      ].flat(),
    )
    return gets.filter(exists).map((p) => PayloadWrapper.parse(p).body)
  }

  protected async insertInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, _typedQuery: ArchivistInsertQuery): Promise<XyoBoundWitness[]> {
    const archive = getArchive(wrapper)
    const bw = toBoundWitnessWithMeta(wrapper, archive)
    const bwResult = await this.boundWitnesses.insertOne(bw)
    if (!bwResult.acknowledged || !bwResult.insertedId) throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitness')
    const payloads = wrapper.payloadsArray.filter(isNotBoundWitness).map((p) => toPayloadWithMeta(p, archive))
    const boundWitnesses = wrapper.payloadsArray
      .filter(isBoundWitness)
      .map((p) => BoundWitnessWrapper.parse(p.payload))
      .map((p) => toBoundWitnessWithMeta(p, archive))
    if (boundWitnesses.length) {
      const boundWitnessesResult = await this.boundWitnesses.insertMany(boundWitnesses)
      if (!boundWitnessesResult.acknowledged || boundWitnessesResult.insertedCount !== boundWitnesses.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
    }
    if (payloads.length) {
      const payloadsResult = await this.payloads.insertMany(payloads)
      if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloads.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
    }
    const result = await this.bindResult([wrapper.boundwitness, ...wrapper.payloadsArray.map((p) => p.payload)])
    return [result[0]]
  }
}
