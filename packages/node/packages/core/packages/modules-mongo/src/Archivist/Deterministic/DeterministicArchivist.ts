import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilledValues } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractArchivist,
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistFindQuery,
  ArchivistFindQuerySchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistParams,
  ArchivistQuery,
} from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AnyConfigSchema,
  ModuleConfig,
  ModuleEventData,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoBoundWitnessWithMeta, XyoPayloadWithMeta, XyoPayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { SortDirection } from 'mongodb'

import { DefaultMaxTimeMS } from '../../defaults'
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

export type MongoDBDeterministicArchivistParams = ArchivistParams<
  AnyConfigSchema<ArchivistConfig>,
  ModuleEventData,
  {
    boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
    payloads: BaseMongoSdk<XyoPayloadWithMeta>
  }
>

const toBoundWitnessWithMeta = (wrapper: BoundWitnessWrapper | QueryBoundWitnessWrapper, archive: string): XyoBoundWitnessWithMeta => {
  const bw = wrapper.boundwitness as XyoBoundWitness
  return { ...bw, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}

const toReturnValue = (value: XyoPayload | XyoBoundWitness): XyoPayload => {
  const _signatures = (value as XyoBoundWitness)?._signatures
  if (_signatures) {
    return { ...PayloadWrapper.parse(value).body, _signatures } as XyoPayload
  } else {
    return { ...PayloadWrapper.parse(value).body }
  }
}

const toPayloadWithMeta = (wrapper: PayloadWrapper, archive: string): XyoPayloadWithMeta => {
  return { ...wrapper.payload, _archive: archive, _hash: wrapper.hash, _timestamp: Date.now() }
}

const searchDepthLimit = 50

export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = ArchivistConfigSchema

  get boundWitnesses() {
    return this.params.boundWitnesses
  }

  get payloads() {
    return this.params.payloads
  }

  override get queries(): string[] {
    return [ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }

  override find(_filter?: PayloadFindFilter): Promise<XyoPayload[]> {
    throw new Error('find method must be called via query')
  }

  override get(_items: string[]): Promise<XyoPayload[]> {
    throw new Error('get method must be called via query')
  }

  insert(_items: XyoPayload[]): Promise<XyoBoundWitness[]> {
    throw new Error('insert method must be called via query')
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
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
    return resultPayloads.map(toReturnValue)
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
    const hashes = typedQuery.hashes
    const payloads = hashes.map((_hash) => this.payloads.findOne({ _hash }))
    const bws = hashes.map((_hash) => this.boundWitnesses.findOne({ _hash }))
    const gets = await Promise.allSettled([payloads, bws].flat())
    const succeeded = gets.reduce<(XyoPayloadWithPartialMeta | null)[]>(fulfilledValues, [])
    return succeeded.filter(exists).map(toReturnValue)
  }

  protected async insertInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, _typedQuery: ArchivistInsertQuery): Promise<XyoBoundWitness[]> {
    const archive = this.address
    const toStore = [wrapper.boundwitness, ...wrapper.payloadsArray.map((p) => p.payload)]
    const [bw, p] = toStore.reduce(validByType, [[], []])
    const boundWitnesses = bw.map((x) => toBoundWitnessWithMeta(x, archive))
    const payloads = p.map((x) => toPayloadWithMeta(x, archive))
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
