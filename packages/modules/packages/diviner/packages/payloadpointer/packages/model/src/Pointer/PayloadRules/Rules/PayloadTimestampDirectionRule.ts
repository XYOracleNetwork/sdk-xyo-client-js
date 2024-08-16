import type { Order } from '@xyo-network/diviner-payload-model'

export interface PayloadTimestampOrderRule {
  order?: Order
  timestamp: number
}
