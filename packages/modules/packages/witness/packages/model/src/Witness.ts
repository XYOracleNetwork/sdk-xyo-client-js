import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export interface Witness {
  observe: (payloads?: Payload[]) => Promisable<Payload[]>
}
