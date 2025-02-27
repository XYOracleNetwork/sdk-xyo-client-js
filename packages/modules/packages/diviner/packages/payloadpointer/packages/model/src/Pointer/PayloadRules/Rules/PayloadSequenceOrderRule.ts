import { Order } from '@xyo-network/diviner-payload-model'
import { Sequence } from '@xyo-network/payload-model'

export interface PayloadSequenceOrderRule {
  order?: Order
  // timestamp: number
  sequence?: Sequence
}
