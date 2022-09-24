import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQuery } from './Queries'
import { Witness } from './Witness'

export class XyoWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig<TTarget> = XyoWitnessConfig<TTarget>>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
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

  override async query<T extends XyoQuery = XyoQuery>(bw: XyoBoundWitness, query: T) {
    assertEx(this.queryable(query.schema, bw.addresses))

    const queryAccount = new XyoAccount()
    const typedQuery = query as XyoWitnessQuery<TTarget>
    switch (typedQuery.schema) {
      case XyoWitnessObserveQuerySchema: {
        const payloads = [await this.observe(typedQuery?.payload)]
        return this.bindPayloads(payloads, queryAccount)
      }

      default: {
        return super.query(bw, typedQuery)
      }
    }
  }
}
