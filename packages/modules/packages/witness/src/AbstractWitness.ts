import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import {
  AbstractModule,
  ModuleConfig,
  ModuleParams,
  ModuleQueryResult,
  QueryBoundWitnessWrapper,
  XyoErrorBuilder,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export abstract class AbstractWitness<TConfig extends XyoWitnessConfig = XyoWitnessConfig> extends AbstractModule<TConfig> implements Witness {
  static override configSchema: string

  override get queries(): string[] {
    return [XyoWitnessObserveQuerySchema, ...super.queries]
  }

  public get targetSet() {
    return this.config?.targetSet
  }

  static override async create(params?: Partial<ModuleParams<XyoWitnessConfig>>): Promise<AbstractWitness> {
    const actualParams: Partial<ModuleParams<XyoWitnessConfig>> = params ?? {}
    actualParams.config = params?.config ?? { schema: this.configSchema }
    return (await super.create(actualParams)) as AbstractWitness
  }

  public observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    this.started('throw')
    const payloadList = assertEx(payloads, 'Trying to witness nothing')
    assertEx(payloadList.length > 0, 'Trying to witness empty list')
    payloadList?.forEach((payload) => assertEx(payload.schema, 'Missing Schema'))
    this.logger?.debug(`result: ${JSON.stringify(payloadList, null, 2)}`)
    return payloadList
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = payloads?.filter((p) => new PayloadWrapper(p).hash !== query.query) || []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case XyoWitnessObserveQuerySchema: {
          const resultPayloads = await this.observe(filteredObservation)
          return this.bindResult(resultPayloads, queryAccount)
        }
        default: {
          return super.query(query, payloads)
        }
      }
    } catch (ex) {
      const error = ex as Error
      return this.bindResult([new XyoErrorBuilder([wrapper.hash], error.message).build()], queryAccount)
    }
  }
}

/** @deprecated use AbstractWitness instead */
export abstract class XyoWitness<
  TTarget extends XyoPayload = XyoPayload,
  TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>,
> extends AbstractWitness<TConfig> {}
