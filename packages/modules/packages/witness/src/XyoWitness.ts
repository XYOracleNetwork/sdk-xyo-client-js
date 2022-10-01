import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { QueryBoundWitnessWrapper, XyoModule, XyoModuleResolverFunc, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export class XyoWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
{
  //we require a config for witnesses
  constructor(config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super(config, account, resolver)
  }

  public get targetSchema() {
    return this.config?.targetSchema
  }

  override queries() {
    return [XyoWitnessObserveQuerySchema, ...super.queries()]
  }

  public observe(fields?: Partial<TTarget> | undefined): Promisable<TTarget> {
    return { ...fields, schema: this.targetSchema } as TTarget
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayloads) {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoWitnessQuery<TTarget>>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoWitnessObserveQuerySchema: {
        const payloads = [await this.observe(typedQuery?.payload)]
        return this.bindResult(payloads, queryAccount)
      }

      default: {
        return super.query(query, payloads)
      }
    }
  }
}
