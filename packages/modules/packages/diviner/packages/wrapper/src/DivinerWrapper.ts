import { assertEx } from '@xylabs/assert'
import { Diviner, XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner-model'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class DivinerWrapper extends ModuleWrapper implements Diviner {
  constructor(module: Module) {
    super(module)
    assertEx(module.queries().includes(XyoDivinerDivineQuerySchema))
  }
  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
