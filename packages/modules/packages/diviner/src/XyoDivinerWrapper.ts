import { XyoModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class XyoDivinerWrapper extends XyoModuleWrapper implements Diviner {
  async divine(payloads?: XyoPayload[]): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[1]
  }
}
