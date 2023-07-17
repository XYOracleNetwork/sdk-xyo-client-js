import { DivinerDivineQuery, DivinerDivineQuerySchema, DivinerModule, isDivinerInstance, isDivinerModule } from '@xyo-network/diviner-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

constructableModuleWrapper()
export class IndirectDivinerWrapper<TWrappedModule extends DivinerModule = DivinerModule>
  extends ModuleWrapper<TWrappedModule>
  implements DivinerModule<TWrappedModule['params']>
{
  static override instanceIdentityCheck = isDivinerInstance
  static override moduleIdentityCheck = isDivinerModule
  static override requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  async divine(payloads?: Payload[]): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<DivinerDivineQuery>({ schema: DivinerDivineQuerySchema })
    return await this.sendQuery(queryPayload, payloads)
  }
}

/** @deprecated use DirectDivinerWrapper or IndirectDivinerWrapper instead */
export class DivinerWrapper<TWrappedModule extends DivinerModule = DivinerModule> extends IndirectDivinerWrapper<TWrappedModule> {}
