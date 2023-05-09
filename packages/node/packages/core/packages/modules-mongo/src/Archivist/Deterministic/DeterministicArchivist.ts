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
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  AnyConfigSchema,
  ModuleConfig,
  ModuleErrorBuilder,
  ModuleQueryResult,
  QueryBoundWitness,
  QueryBoundWitnessWrapper,
} from '@xyo-network/module'
import { BoundWitnessWithMeta, PayloadWithMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { SortDirection } from 'mongodb'

import { DefaultMaxTimeMS } from '../../defaults'
import {
  BoundWitnessesFilter,
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
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
    payloadSdk: BaseMongoSdk<PayloadWithMeta>
  }
>

const toBoundWitnessWithMeta = (wrapper: BoundWitnessWrapper | QueryBoundWitnessWrapper): BoundWitnessWithMeta => {
  const bw = wrapper.boundwitness as BoundWitness
  return { ...bw, _hash: wrapper.hash, _timestamp: Date.now() }
}

const toReturnValue = (value: Payload | BoundWitness): Payload => {
  const _signatures = (value as BoundWitness)?._signatures
  if (_signatures) {
    return { ...PayloadWrapper.parse(value).body, _signatures } as Payload
  } else {
    return { ...PayloadWrapper.parse(value).body }
  }
}

const toPayloadWithMeta = (wrapper: PayloadWrapper): PayloadWithMeta => {
  return { ...wrapper.payload, _hash: wrapper.hash, _timestamp: Date.now() }
}

const searchDepthLimit = 50

export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends AbstractArchivist<TParams> {
  static override configSchema = ArchivistConfigSchema

  get boundWitnesses() {
    return this.params.boundWitnessSdk
  }

  get payloads() {
    return this.params.payloadSdk
  }

  override get queries(): string[] {
    return [ArchivistFindQuerySchema, ArchivistInsertQuerySchema, ...super.queries]
  }

  override find(_filter?: PayloadFindFilter): Promise<Payload[]> {
    throw new Error('find method must be called via query')
  }

  override get(_items: string[]): Promise<Payload[]> {
    throw new Error('get method must be called via query')
  }

  insert(_items: Payload[]): Promise<BoundWitness[]> {
    throw new Error('insert method must be called via query')
  }

  protected async findBoundWitness(
    filter: BoundWitnessesFilter,
    sort: { [key: string]: SortDirection } = { _timestamp: -1 },
  ): Promise<BoundWitnessWithMeta | undefined> {
    return (await (await this.boundWitnesses.find(filter)).sort(sort).limit(1).maxTimeMS(DefaultMaxTimeMS).toArray()).pop()
  }

  protected async findInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistFindQuery): Promise<Payload[]> {
    const limit = getLimit(typedQuery)
    const [bwFilter, payloadFilter] = getFilter(wrapper, typedQuery)
    const resultPayloads: (BoundWitnessWithMeta | PayloadWithMeta)[] = []
    const findBWs = shouldFindBoundWitnesses(typedQuery)
    const findPayloads = shouldFindPayloads(typedQuery)
    const payloadSchemas = getPayloadSchemas(typedQuery)
    let currentBw: BoundWitnessWithMeta | undefined
    let nextHash: string | null | undefined = undefined
    for (let searchDepth = 0; searchDepth < searchDepthLimit; searchDepth++) {
      if (resultPayloads.length >= limit) break
      currentBw = await this.findBoundWitness(bwFilter)
      if (!currentBw) break
      if (findBWs) resultPayloads.push(currentBw)
      if (findPayloads) {
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
              return schema?.startsWith(BoundWitnessSchema) ? this.findBoundWitness({ _hash }) : this.findPayload({ ...payloadFilter, _hash })
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

  protected async findPayload(filter: PayloadsFilter): Promise<PayloadWithMeta | undefined> {
    const { order, offset, schema, _hash } = filter as PayloadFindFilter & PayloadsFilter
    const sort: { [key: string]: SortDirection } = { _timestamp: order === 'asc' ? 1 : -1 }
    const parsedTimestamp = offset ? parseInt(`${offset}`) : order === 'asc' ? 0 : Date.now()
    const _timestamp = order === 'asc' ? { $gte: parsedTimestamp } : { $lte: parsedTimestamp }
    const find: PayloadsFilter = { _timestamp }
    if (schema) find.schema = schema
    if (_hash) find._hash = _hash
    const result = await (await this.payloads.find(find)).limit(1).sort(sort).maxTimeMS(DefaultMaxTimeMS).toArray()
    return result.pop()
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<Payload[]> {
    const hashes = typedQuery.hashes
    const payloads = hashes.map((_hash) => this.payloads.findOne({ _hash }))
    const bws = hashes.map((_hash) => this.boundWitnesses.findOne({ _hash }))
    const gets = await Promise.allSettled([payloads, bws].flat())
    const succeeded = gets.reduce<(PayloadWithPartialMeta | null)[]>(fulfilledValues, [])
    return succeeded.filter(exists).map(toReturnValue)
  }

  protected async insertInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, _typedQuery: ArchivistInsertQuery): Promise<BoundWitness[]> {
    const toStore = [wrapper.boundwitness, ...wrapper.payloadsArray.map((p) => p.payload)]
    const [bw, p] = toStore.reduce(validByType, [[], []])
    const boundWitnesses = bw.map((x) => toBoundWitnessWithMeta(x))
    const payloads = p.map((x) => toPayloadWithMeta(x))
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
    const result = await this.bindQueryResult(typedQuery, [wrapper.boundwitness, ...wrapper.payloadsArray.map((p) => p.payload)])
    return [result[0]]
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
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
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new ModuleErrorBuilder().sources([wrapper.hash]).message(error.message).build())
    }
    return this.bindQueryResult(typedQuery, resultPayloads, [queryAccount])
  }
}
