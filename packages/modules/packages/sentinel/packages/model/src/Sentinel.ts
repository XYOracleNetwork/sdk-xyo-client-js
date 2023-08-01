import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export interface Sentinel {
  report: (payloads?: Payload[]) => Promisable<Payload[]>
}
