import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { QueryBoundWitnessWrapper, XyoModule, XyoModuleConfig, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export type XyoWitnessParams<TConfig extends XyoModuleConfig = XyoModuleConfig> = XyoModuleParams<TConfig>

export class XyoWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
{
  public get targetSchema() {
    return this.config?.targetSchema
  }

  override queries() {
    return [XyoWitnessObserveQuerySchema, ...super.queries()]
  }

  public observe(fields?: Partial<XyoPayload>[]): Promisable<TTarget[]> {
    this.checkInitialized('Observe')
    return (
      fields?.map((fieldsItem) => {
        return { ...fieldsItem, schema: this.targetSchema } as TTarget
      }) ?? []
    )
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery<TTarget>>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoWitnessObserveQuerySchema: {
        const resultPayloads = await this.observe(payloads)
        return this.bindResult(resultPayloads, queryAccount)
      }

      default: {
        return super.query(query, payloads)
      }
    }
  }
}
