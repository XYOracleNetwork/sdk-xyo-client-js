import { RetryConfig } from '@xylabs/retry'
import { Payload, WithMeta, WithSources } from '@xyo-network/payload-model'

export interface DivinerQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  divine: (payloads?: TIn[], retry?: RetryConfig) => Promise<WithMeta<WithSources<TOut>>[]>
}
