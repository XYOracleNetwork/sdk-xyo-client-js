import { Promisable } from '@xylabs/promise'
import { Payload } from '@xyo-network/payload-model'

export interface Sentinel {
  report: (payloads?: Payload[]) => Promisable<Payload[]>
}
