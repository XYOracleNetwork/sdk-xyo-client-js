import type { Order } from '@xyo-network/diviner-payload-model'
import type { Sequence } from '@xyo-network/payload-model'

export interface PayloadSequenceOrderRule {
  order?: Order
  // timestamp: number
  sequence?: Sequence
}
