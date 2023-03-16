import { assertEx } from '@xylabs/assert'
import { AccountInstance } from '@xyo-network/account-model'
import { DivinerModule, XyoDivinerDivineQuery, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner-model'
import { ModuleWrapper } from '@xyo-network/module'
import { Module } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class DivinerWrapper<TWrappedModule extends DivinerModule = DivinerModule> extends ModuleWrapper<TWrappedModule> implements DivinerModule {
  static override requiredQueries = [XyoDivinerDivineQuerySchema, ...super.requiredQueries]

  static override tryWrap(module?: Module, account?: AccountInstance): DivinerWrapper | undefined {
    if (module) {
      const missingRequiredQueries = this.missingRequiredQueries(module)
      if (missingRequiredQueries.length > 0) {
        //console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
      } else {
        return new DivinerWrapper({ account, module: module as DivinerModule })
      }
    }
  }

  static override wrap(module?: Module, account?: AccountInstance): DivinerWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as DivinerWrapper')
  }

  async divine(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoDivinerDivineQuery>({ schema: XyoDivinerDivineQuerySchema })
    const result = await this.sendQuery(queryPayload, payloads)
    return result
  }
}
