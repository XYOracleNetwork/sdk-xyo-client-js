import { XyoAccount } from '@xyo-network/account'
import { XyoModule, XyoModuleInitializeQuerySchema, XyoModuleQueryResult, XyoModuleShutdownQuerySchema } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoDivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery } from './Queries'

export abstract class XyoDiviner<TConfig extends XyoDivinerConfig = XyoDivinerConfig, TQuery extends XyoDivinerQuery = XyoDivinerQuery>
  extends XyoModule<TQuery, TConfig>
  implements DivinerModule<TQuery>
{
  abstract divine(payloads?: XyoPayloads): Promisable<XyoPayload | null>

  public override queries(): TQuery['schema'][] {
    return [XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoDivinerDivineQuerySchema]
  }

  async query(query: TQuery): Promise<XyoModuleQueryResult> {
    const queryAccount = new XyoAccount()
    if (!this.queries().find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: XyoPayloads = []
    switch (query.schema) {
      case XyoDivinerDivineQuerySchema:
        payloads.push(await this.divine(query.payloads))
        break
      default:
        return super.query(query)
    }
    return await this.bindPayloads(payloads, queryAccount)
  }
}

export abstract class XyoTimestampDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQuery extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoDiviner<TConfig, TQuery> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQuery extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoDiviner<TConfig, TQuery> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQuery extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoTimestampDiviner<TConfig, TQuery> {}
