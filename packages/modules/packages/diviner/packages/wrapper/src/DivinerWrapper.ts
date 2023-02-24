import { assertEx } from '@xylabs/assert'
import { Diviner, DivinerModule, XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner-model'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class DivinerWrapper extends ModuleWrapper implements Diviner {
  static override requiredQueries = [XyoDivinerDivineQuerySchema, ...super.requiredQueries]

  constructor(module: Module) {
    super(module)
    assertEx(module.queries.includes(XyoDivinerDivineQuerySchema))
  }

  static override tryWrap(module: Module): DivinerWrapper | undefined {
    const missingRequiredQueries = this.missingRequiredQueries(module)
    if (missingRequiredQueries.length > 0) {
      console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
    } else {
      return new DivinerWrapper(module as DivinerModule)
    }
  }

  static override wrap(module: Module): DivinerWrapper {
    return assertEx(this.tryWrap(module), 'Unable to wrap module as DivinerWrapper')
  }

  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
