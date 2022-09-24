import { XyoModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayloads } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class XyoDivinerWrapper extends XyoModuleWrapper implements Diviner {
  async divine(query: string, payloads?: XyoPayloads): Promise<XyoPayloads> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const boundQuery = await this.bindQuery([queryPayload.body, ...(payloads ?? [])], queryPayload.hash)
    return (await this.module.query(boundQuery[0], boundQuery[1]))[1]
  }
}
