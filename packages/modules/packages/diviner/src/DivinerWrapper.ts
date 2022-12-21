import { assertEx } from '@xylabs/assert'
import { Module, ModuleWrapper } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'

import { Diviner } from './Diviner'
import { XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from './Queries'

export class DivinerWrapper extends ModuleWrapper implements Diviner {
  constructor(module: Module) {
    super(module)
    assertEx(module.queries().includes(XyoDivinerDivineQuerySchema))
  }
  divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    return this.sendQuery(queryPayload, payloads)
  }
}
