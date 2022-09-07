import { XyoModule } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Query'

export class XyoDivinerWrapper implements Diviner<XyoPayload | null> {
  protected module: XyoModule

  constructor(module: XyoModule) {
    this.module = module
  }

  public get queries() {
    return this.module.queries
  }

  async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const query: XyoDivinerDivineQuery = { payloads, schema: XyoDivinerDivineQuerySchema }
    return (await this.module.query(query))[1][0]
  }
}
