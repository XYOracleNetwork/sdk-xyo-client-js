import { RetryConfig } from '@xylabs/retry'
import { AccountInstance } from '@xyo-network/account-model'
import {
  DivinerDivineQuery,
  DivinerDivineQuerySchema,
  DivinerInstance,
  DivinerModule,
  DivinerParams,
  isDivinerInstance,
  isDivinerModule,
} from '@xyo-network/diviner-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import {
  Payload, WithoutPrivateStorageMeta, WithSources,
} from '@xyo-network/payload-model'

constructableModuleWrapper()
export class DivinerWrapper<TWrappedModule extends DivinerModule<DivinerParams>, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends ModuleWrapper<TWrappedModule>
  implements DivinerInstance<TWrappedModule['params'], TIn, TOut> {
  static override readonly instanceIdentityCheck = isDivinerInstance
  static override readonly moduleIdentityCheck = isDivinerModule
  static override readonly requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  async divine(payloads?: TIn[], _retryConfig?: RetryConfig): Promise<WithoutPrivateStorageMeta<WithSources<TOut>>[]> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQuery(queryPayload, payloads)
  }

  async divineQuery(payloads?: TIn[], account?: AccountInstance, _retryConfig?: RetryConfig): Promise<ModuleQueryResult<TOut>> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }
}
