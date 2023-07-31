import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export interface DivinerQueryFunctions {
  divine: (payloads?: Payload[]) => Promisable<Payload[]>
}
