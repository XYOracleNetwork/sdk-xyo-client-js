import { Promisable } from '@xylabs/promise'
import { RetryConfig } from '@xylabs/retry'
import { Payload, WithMeta } from '@xyo-network/payload-model'

export type WithSources<T extends Payload> = WithMeta<T, { sources: string[] }>

export interface DivinerQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  divine: (payloads?: TIn[], retry?: RetryConfig) => Promisable<WithSources<TOut>[]>
}
