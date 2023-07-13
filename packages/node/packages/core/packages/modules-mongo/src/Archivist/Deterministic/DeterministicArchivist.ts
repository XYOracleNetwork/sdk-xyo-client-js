import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilledValues } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  AbstractIndirectArchivist,
  ArchivistConfig,
  ArchivistConfigSchema,
  ArchivistGetQuerySchema,
  ArchivistInsertQuerySchema,
  ArchivistParams,
  ArchivistQuery,
} from '@xyo-network/archivist'
import { QueryBoundWitness, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { handleErrorAsync } from '@xyo-network/error'
import { AnyConfigSchema, ModuleConfig, ModuleErrorBuilder, ModuleQueryResult } from '@xyo-network/module'
import { BoundWitnessWithMeta, PayloadWithMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { ModuleError, Payload } from '@xyo-network/payload-model'
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
    return { ...PayloadWrapper.wrap(value).body(), _signatures } as BoundWitness
  } else {
    return { ...PayloadWrapper.wrap(value).body() }
  }
}

const toPayloadWithMeta = async (wrapper: PayloadWrapper): Promise<PayloadWithMeta> => {
  return { ...wrapper.payload(), _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}

export class MongoDBDeterministicArchivist<
  TParams extends MongoDBDeterministicArchivistParams = MongoDBDeterministicArchivistParams,
> extends AbstractIndirectArchivist<TParams> {
  static override configSchemas = [ArchivistConfigSchema]

  get boundWitnesses() {
    return this.params.boundWitnessSdk
  }

  get payloads() {
    return this.params.payloadSdk
  }

  override get queries(): string[] {
    return [ArchivistInsertQuerySchema, ...super.queries]
  }

  override async head(): Promise<Payload | undefined> {
    const head = await (await this.payloads.find({})).sort({ _timestamp: -1 }).limit(1).toArray()
    return head[0] ? PayloadWrapper.wrap(head[0]).body() : undefined
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = hashes.map((_hash) => this.payloads.findOne({ _hash }))
    const bws = hashes.map((_hash) => this.boundWitnesses.findOne({ _hash }))
    const gets = await Promise.allSettled([payloads, bws].flat())
    const succeeded = gets.reduce<(PayloadWithPartialMeta | null)[]>(fulfilledValues, [])
    return succeeded.filter(exists).map(toReturnValue)
  }

  protected override async insertHandler(payloads?: Payload[]): Promise<BoundWitness[]> {
    const [bw, p] = await validByType(payloads)
    const boundWitnesses = await Promise.all(bw.map((x) => toBoundWitnessWithMeta(x)))
    const payloadsWithMeta = await Promise.all(p.map((x) => toPayloadWithMeta(x)))
    if (boundWitnesses.length) {
      const boundWitnessesResult = await this.boundWitnesses.insertMany(boundWitnesses)
      if (!boundWitnessesResult.acknowledged || boundWitnessesResult.insertedCount !== boundWitnesses.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
    }
    if (payloadsWithMeta.length) {
      const payloadsResult = await this.payloads.insertMany(payloadsWithMeta)
      if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloadsWithMeta.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
    }
    return boundWitnesses
  }

  protected override async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ArchivistQuery>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    // TODO: Use new Account once we mock Account.new in Jest
    const queryAccount = Account.randomSync()
    // const queryAccount = Account.randomSync()
    try {
      switch (queryPayload.schema) {
        case ArchivistGetQuerySchema: {
          resultPayloads.push(...(await this.getHandler(queryPayload.hashes)))
          break
        }
        case ArchivistInsertQuerySchema: {
          await this.insertHandler([wrapper.boundwitness, ...(payloads ?? [])])
          const [result] = await this.bindQueryResult(queryPayload, [wrapper.boundwitness, ...(payloads ?? [])])
          resultPayloads.push(result[0])
          break
        }
        default:
          return super.queryHandler(query, payloads)
      }
    } catch (ex) {
      await handleErrorAsync(ex, async (error) => {
        errorPayloads.push(
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        )
      })
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount], errorPayloads))[0]
  }
}
