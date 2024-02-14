import {
  DivinerDivineQuery,
  DivinerDivineQuerySchema,
  DivinerInstance,
  DivinerModule,
  DivinerParams,
  isDivinerInstance,
  isDivinerModule,
} from '@xyo-network/diviner-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import { Payload, WithMeta, WithSources } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class DivinerWrapper<
    TWrappedModule extends DivinerModule<DivinerParams, TIn, TOut>,
    TIn extends Payload = Payload,
    TOut extends Payload = Payload,
  >
  extends ModuleWrapper<TWrappedModule>
  implements DivinerInstance<TWrappedModule['params'], TIn, TOut>
{
  static override instanceIdentityCheck = isDivinerInstance
  static override moduleIdentityCheck = isDivinerModule
  static override requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  async divine(payloads?: TIn[]): Promise<WithMeta<WithSources<TOut>>[]> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQuery(queryPayload, payloads)
  }
}
