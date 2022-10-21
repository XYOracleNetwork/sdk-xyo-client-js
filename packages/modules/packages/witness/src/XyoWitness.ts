import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { QueryBoundWitnessWrapper, XyoErrorBuilder, XyoModule, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export class XyoWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
{
  static override async create(params?: XyoModuleParams<XyoWitnessConfig>): Promise<XyoWitness> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const actualParams: XyoModuleParams<XyoWitnessConfig> = params ?? {}
    actualParams.config = params?.config ?? { schema: this.configSchema, targetSchema: this.targetSchema }
    const module = new this(actualParams)
    await module.start()
    return module
  }

  static targetSchema: string

  static configSchema: string

  public get targetSchema() {
    return this.config?.targetSchema
  }

  override queries() {
    return [XyoWitnessObserveQuerySchema, ...super.queries()]
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

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery<TTarget>>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()
    try {
      switch (typedQuery.schema) {
        case XyoWitnessObserveQuerySchema: {
          const resultPayloads = await this.observe(payloads)
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
