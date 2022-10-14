import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { ModuleQueryResult, QueryBoundWitnessWrapper, XyoModule, XyoModuleParams, XyoQueryBoundWitness } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from './Queries'

export type XyoDivinerParams = XyoModuleParams

export abstract class XyoDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoModule<TConfig> implements DivinerModule {
  abstract divine(payloads?: XyoPayloads): Promisable<XyoPayloads>

  public override queries(): string[] {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(
    query: T,
    payloads?: XyoPayload[],
  ): Promise<ModuleQueryResult<XyoPayload>> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoDivinerQuery>(query, payloads)
    const typedQuery = wrapper.query
    assertEx(this.queryable(query.schema, wrapper.addresses))

    const queryAccount = new XyoAccount()

    const resultPayloads: XyoPayloads = []
    switch (typedQuery.schemaName) {
      case XyoDivinerDivineQuerySchema:
        resultPayloads.push(...(await this.divine(payloads)))
        break
      default:
        return super.query(query, payloads)
    }
    return await this.bindResult(resultPayloads, queryAccount)
  }
}

export abstract class XyoTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoDiviner<TConfig> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig> extends XyoTimestampDiviner<TConfig> {}
