import type { RetryConfig } from '@xylabs/retry'
import type { AccountInstance } from '@xyo-network/account-model'
import type {
  DivinerDivineQuery,
  DivinerInstance,
  DivinerModule,
  DivinerParams,
} from '@xyo-network/diviner-model'
import {
  DivinerDivineQuerySchema,
  isDivinerInstance,
  isDivinerModule,
} from '@xyo-network/diviner-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import { constructableModuleWrapper, ModuleWrapper } from '@xyo-network/module-wrapper'
import type { Payload, WithSources } from '@xyo-network/payload-model'

constructableModuleWrapper()
export class DivinerWrapper<TWrappedModule extends DivinerModule<DivinerParams>, TIn extends Payload = Payload, TOut extends Payload = Payload>
  extends ModuleWrapper<TWrappedModule>
  implements DivinerInstance<TWrappedModule['params'], TIn, TOut> {
  static override instanceIdentityCheck = isDivinerInstance
  static override moduleIdentityCheck = isDivinerModule
  static override requiredQueries = [DivinerDivineQuerySchema, ...super.requiredQueries]

  async divine(payloads?: TIn[], _retryConfig?: RetryConfig): Promise<WithSources<TOut>[]> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQuery(queryPayload, payloads)
  }

  async divineQuery(payloads?: TIn[], account?: AccountInstance, _retryConfig?: RetryConfig): Promise<ModuleQueryResult<TOut>> {
    const queryPayload: DivinerDivineQuery = { schema: DivinerDivineQuerySchema }
    return await this.sendQueryRaw(queryPayload, payloads, account)
  }
}
