import { Promisable } from '@xylabs/promise'
import { RetryConfig } from '@xylabs/retry'
import { Payload } from '@xyo-network/payload-model'

export interface DivinerQueryFunctions<TIn extends Payload = Payload, TOut extends Payload = Payload> {
  divine: (payloads?: TIn[], retry?: RetryConfig) => Promisable<TOut[]>
}
