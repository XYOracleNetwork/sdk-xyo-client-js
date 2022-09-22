import { XyoModuleWrapper } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class XyoDivinerWrapper extends XyoModuleWrapper implements Diviner {
  async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const query: XyoDivinerDivineQuery = { payloads, schema: XyoDivinerDivineQuerySchema }
    const bw = (await this.bindPayloads([query]))[0]
    return (await this.module.query(bw, query))[1][0]
  }
}
