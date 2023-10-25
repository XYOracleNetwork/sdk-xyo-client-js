import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

export interface DivinerQueryFunctions {
  divine: (payloads?: Payload[]) => Promisable<Payload[]>
}
