import { Promisable } from '@xylabs/promise'
import { RetryConfig } from '@xylabs/retry'
import { Payload } from '@xyo-network/payload-model'

export interface DivinerQueryFunctions {
  divine: (payloads?: Payload[], retry?: RetryConfig) => Promisable<Payload[]>
}
