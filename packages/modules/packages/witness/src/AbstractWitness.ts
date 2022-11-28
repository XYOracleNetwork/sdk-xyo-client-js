import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { QueryBoundWitnessWrapper, XyoErrorBuilder, XyoModule, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export abstract class AbstractWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
{
  static override configSchema: string
  static targetSchema: string

  public get targetSchema() {
    return this.config?.targetSchema
  }

  static override async create(params?: Partial<XyoModuleParams<XyoWitnessConfig>>): Promise<AbstractWitness> {
    const actualParams: Partial<XyoModuleParams<XyoWitnessConfig>> = params ?? {}
    actualParams.config = params?.config ?? { schema: this.configSchema, targetSchema: this.targetSchema }
    return (await super.create(actualParams)) as AbstractWitness
  }

  public observe(fields?: Partial<XyoPayload>[]): Promisable<TTarget[]> {
    this.started('throw')
    const result =
      fields?.map((fieldsItem) => {
        return { ...fieldsItem, schema: this.targetSchema } as TTarget
      }) ?? []
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  override queries() {
    return [XyoWitnessObserveQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery<TTarget>>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))
    // Remove the query payload from the arguments passed to us so we don't observe it
    const filteredObservation = payloads?.filter((p) => new PayloadWrapper(p).hash !== query.query) || []
    const queryAccount = new XyoAccount()
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
> extends AbstractWitness<TTarget, TConfig> {}
