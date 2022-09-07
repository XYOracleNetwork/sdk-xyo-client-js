import { XyoModule, XyoModuleInitializeQuerySchema, XyoModuleQueryResult, XyoModuleShutdownQuerySchema } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoDivinerConfig } from './Config'
import { DivinerModule } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery, XyoDivinerQuerySchema } from './Queries'

export abstract class XyoDiviner<
    TDivineResult extends XyoPayload = XyoPayload,
    TConfig extends XyoDivinerConfig = XyoDivinerConfig,
    TQuery extends XyoDivinerQuery<TDivineResult> = XyoDivinerQuery<TDivineResult>,
  >
  extends XyoModule<TConfig, TQuery, TDivineResult>
  implements DivinerModule<TDivineResult, TQuery, TDivineResult>
{
  abstract divine(payloads?: XyoPayloads<TDivineResult>): Promisable<TDivineResult | null>

  public override get queries(): (TQuery['schema'] | XyoDivinerQuerySchema)[] {
    return [XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoDivinerDivineQuerySchema]
  }

  async query(query: TQuery): Promise<XyoModuleQueryResult<TDivineResult>> {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (TDivineResult | null)[] = []
    switch (query.schema) {
      case XyoDivinerDivineQuerySchema:
        payloads.push(await this.divine(query.payloads))
        break
    }
    return [this.bindPayloads(payloads), payloads]
  }
}

export abstract class XyoTimestampDiviner<
  TPayload extends XyoPayload = XyoPayload,
  TConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
  TQuery extends XyoDivinerQuery<TPayload> = XyoDivinerQuery<TPayload>,
> extends XyoDiviner<TPayload, TConfig, TQuery> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQuery extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoDiviner<XyoPayload, TConfig, TQuery> {}

/** @deprecated use XyoDiviner instead*/
export abstract class XyoAbstractTimestampDiviner<
  TConfig extends XyoDivinerConfig = XyoDivinerConfig,
  TQuery extends XyoDivinerQuery = XyoDivinerQuery,
> extends XyoTimestampDiviner<XyoPayload, TConfig, TQuery> {}
