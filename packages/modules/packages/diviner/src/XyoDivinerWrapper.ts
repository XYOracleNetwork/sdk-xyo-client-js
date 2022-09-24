import { XyoModuleWrapper } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class XyoDivinerWrapper extends XyoModuleWrapper implements Diviner {
  async divine(context?: string, payloads?: XyoPayloads): Promise<XyoPayloads> {
    const query: XyoDivinerDivineQuery = { context, payloads, schema: XyoDivinerDivineQuerySchema }
    const bw = (await this.bindPayloads([query]))[0]
    return (await this.module.query(bw, query))[1]
  }
}
