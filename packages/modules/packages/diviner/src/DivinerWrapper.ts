import { ModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class DivinerWrapper extends ModuleWrapper implements Diviner {
  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result[1]
  }
}

/** @deprecated use DivinerWrapper instead */
export class XyoDivinerWrapper extends DivinerWrapper {}
