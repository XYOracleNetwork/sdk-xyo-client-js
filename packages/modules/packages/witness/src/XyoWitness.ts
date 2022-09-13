import { XyoAccount } from '@xyo-network/account'
import { XyoModule, XyoModuleQueryResult } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export abstract class XyoWitness<
    TTarget extends XyoPayload = XyoPayload,
    TConfig extends XyoWitnessConfig = XyoWitnessConfig,
    TQuery extends XyoWitnessQuery<TTarget> = XyoWitnessQuery<TTarget>,
  >
  extends XyoModule<TConfig, TQuery, TTarget>
  implements Witness<TTarget, TQuery>
{
  //we require a config for witnesses
  constructor(config?: TConfig, account?: XyoAccount, resolver?: (address: string) => XyoModule) {
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

  async query(query: TQuery): Promise<XyoModuleQueryResult<TTarget>> {
    switch (query.schema) {
      case XyoWitnessObserveQuerySchema: {
        const payloads = [await this.observe(query?.payload)]
        return [this.bindPayloads(payloads), payloads]
      }
      default: {
        return super.query(query)
      }
    }
  }
}

export abstract class XyoTimestampWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<
  T,
  C
> {
  public observe(fields?: Partial<T> | undefined): Promisable<T> {
    return { ...fields, schema: this.targetSchema, timestamp: Date.now() } as T
  }
}
