import { Address } from '@xylabs/hex'
import { Order } from '@xyo-network/diviner-payload-model'
import { Schema } from '@xyo-network/payload-model'

export interface PayloadSearchCriteria {
  addresses: Address[]
  order: Order
  schemas: Schema[]
  timestamp: number
}
