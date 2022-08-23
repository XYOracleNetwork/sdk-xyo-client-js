import { XyoAbstractModule, XyoModuleQueryResult } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoDivinerConfig } from './Config'
import { Diviner } from './Diviner'
import { XyoDivinerDivineQuerySchema, XyoDivinerQueryPayload, XyoDivinerQuerySchema } from './Query'
import { XyoDiviner } from './XyoDiviner'

export abstract class XyoAbstractDiviner<
    TConfig extends XyoDivinerConfig = XyoDivinerConfig,
    TQuerySchema extends string = XyoDivinerQuerySchema,
    TQuery extends XyoDivinerQueryPayload = XyoDivinerQueryPayload,
  >
  extends XyoAbstractModule<TConfig, TQuery>
  implements XyoDiviner<TQuery>, Diviner<Promisable<XyoPayload | null>>
{
  abstract divine(payloads?: XyoPayloads): Promisable<XyoPayload | null>

  public override get queries(): (TQuerySchema | XyoDivinerQuerySchema)[] {
    return [XyoDivinerDivineQuerySchema]
  }

  async query(query: XyoDivinerQueryPayload): Promise<XyoModuleQueryResult> {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (XyoPayload | null)[] = []
    switch (query.schema) {
      case XyoDivinerDivineQuerySchema:
        payloads.push(await this.divine(query.payloads))
        break
    }
    return [this.bindPayloads(payloads), payloads]
  }
}

export abstract class XyoAbstractTimestampDiviner<C extends XyoDivinerConfig = XyoDivinerConfig> extends XyoAbstractDiviner<C> {}
