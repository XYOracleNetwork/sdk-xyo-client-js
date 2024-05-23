import { RetryConfig } from '@xylabs/retry'
import { AccountInstance } from '@xyo-network/account-model'
import { ModuleQueryResult } from '@xyo-network/module-model'
import { Payload, WithMeta, WithSources } from '@xyo-network/payload-model'

export interface DivinerQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  divine: (payloads?: TIn[], retry?: RetryConfig) => Promise<WithMeta<WithSources<TOut>>[]>
  divineQuery: (payloads?: TIn[], account?: AccountInstance, retry?: RetryConfig) => Promise<ModuleQueryResult<TOut>>
}
