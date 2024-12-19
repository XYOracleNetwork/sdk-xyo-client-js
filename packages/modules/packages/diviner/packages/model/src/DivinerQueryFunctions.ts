import type { RetryConfig } from '@xylabs/retry'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ModuleQueryResult } from '@xyo-network/module-model'
import type {
  Payload, WithOptionalSources, WithoutPrivateStorageMeta,
} from '@xyo-network/payload-model'

export type DivinerDivineResult<T extends Payload> = WithoutPrivateStorageMeta<WithOptionalSources<T>>

export interface DivinerQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  divine: (payloads?: TIn[], retry?: RetryConfig) => Promise<DivinerDivineResult<TOut>[]>
  divineQuery: (payloads?: TIn[], account?: AccountInstance, retry?: RetryConfig) => Promise<ModuleQueryResult<TOut>>
}
