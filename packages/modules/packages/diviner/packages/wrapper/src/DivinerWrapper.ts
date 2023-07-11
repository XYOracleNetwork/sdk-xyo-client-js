import { DivinerDivineQuery, DivinerDivineQuerySchema, DivinerModule, isDivinerInstance } from '@xyo-network/diviner-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class DivinerWrapper<TWrappedModule extends DivinerModule = DivinerModule> extends ModuleWrapper<TWrappedModule> implements DivinerModule {
  static override requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  async divine(payloads?: Payload[]): Promise<Payload[]> {
    if (isDivinerInstance(this.module)) {
      return await this.module.divine(payloads)
    }
    const queryPayload = PayloadWrapper.wrap<DivinerDivineQuery>({ schema: DivinerDivineQuerySchema })
    return await this.sendQuery(queryPayload, payloads)
  }
}
