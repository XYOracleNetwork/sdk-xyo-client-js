import { XyoModule, XyoModuleInitializeQuerySchema, XyoModuleQueryResult, XyoModuleShutdownQuerySchema } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoDivinerConfig } from './Config'
import { Diviner } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQuery, XyoDivinerQuerySchema } from './Query'

export abstract class XyoDiviner<
    TPayload extends XyoPayload = XyoPayload,
    TConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
    TQuery extends XyoDivinerQuery<TPayload> = XyoDivinerQuery<TPayload>,
  >
  extends XyoModule<TConfig>
  implements Diviner<TPayload | null>
{
  abstract divine(payloads?: XyoPayloads<TPayload>): Promisable<TPayload | null>

  public override get queries(): (TQuery['schema'] | XyoDivinerQuerySchema)[] {
    return [XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoDivinerDivineQuerySchema]
  }

  async query(query: TQuery): Promise<XyoModuleQueryResult> {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (TPayload | null)[] = []
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
