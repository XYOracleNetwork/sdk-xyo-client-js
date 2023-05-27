import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilledValues } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractArchivist,
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistGetQuery,
  ArchivistGetQuerySchema,
  ArchivistInsertQuery,
  ArchivistInsertQuerySchema,
  ArchivistParams,
  ArchivistQuery,
} from '@xyo-network/archivist'
import { BoundWitness } from '@xyo-network/boundwitness-model'
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
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { validByType } from './validByType'

export type MongoDBDeterministicArchivistParams = ArchivistParams<
  AnyConfigSchema<ArchivistConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
    payloadSdk: BaseMongoSdk<PayloadWithMeta>
  }
>

const toBoundWitnessWithMeta = async (wrapper: BoundWitnessWrapper | QueryBoundWitnessWrapper): Promise<BoundWitnessWithMeta> => {
  const bw = wrapper.boundwitness as BoundWitness
  return { ...bw, _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}

const toReturnValue = (value: Payload | BoundWitness): Payload => {
  const _signatures = (value as BoundWitness)?._signatures
  if (_signatures) {
    return { ...PayloadWrapper.parse(value).body, _signatures } as Payload
  } else {
    return { ...PayloadWrapper.parse(value).body }
  }
}

const toPayloadWithMeta = async (wrapper: PayloadWrapper): Promise<PayloadWithMeta> => {
  return { ...wrapper.payload, _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}

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
    return [ArchivistInsertQuerySchema, ...super.queries]
  }

  override get(_items: string[]): Promise<Payload[]> {
    throw new Error('get method must be called via query')
  }

  override async head(): Promise<Payload | undefined> {
    const head = await (await this.payloads.find({})).sort({ _timestamp: -1 }).limit(1).toArray()
    return head[0] ? PayloadWrapper.parse(head[0]).body : undefined
  }

  insert(_items: Payload[]): Promise<BoundWitness[]> {
    throw new Error('insert method must be called via query')
  }

  protected async getInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistGetQuery): Promise<Payload[]> {
    const hashes = typedQuery.hashes
    const payloads = hashes.map((_hash) => this.payloads.findOne({ _hash }))
    const bws = hashes.map((_hash) => this.boundWitnesses.findOne({ _hash }))
    const gets = await Promise.allSettled([payloads, bws].flat())
    const succeeded = gets.reduce<(PayloadWithPartialMeta | null)[]>(fulfilledValues, [])
    return succeeded.filter(exists).map(toReturnValue)
  }

  protected async insertInternal(wrapper: QueryBoundWitnessWrapper<ArchivistQuery>, typedQuery: ArchivistInsertQuery): Promise<BoundWitness[]> {
    const toStore = [wrapper.boundwitness, ...wrapper.payloadsArray.map((p) => p.payload)]
    const [bw, p] = await validByType(toStore)
    const boundWitnesses = await Promise.all(bw.map((x) => toBoundWitnessWithMeta(x)))
    const payloads = await Promise.all(p.map((x) => toPayloadWithMeta(x)))
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
      resultPayloads.push(
        new ModuleErrorBuilder()
          .sources([await wrapper.hashAsync()])
          .message(error.message)
          .build(),
      )
    }
    return this.bindQueryResult(typedQuery, resultPayloads, [queryAccount])
  }
}
