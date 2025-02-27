import { Address } from '@xylabs/hex'
import { Order } from '@xyo-network/diviner-payload-model'
import { Schema, Sequence } from '@xyo-network/payload-model'

export interface PayloadSearchCriteria {
  addresses: Address[]
  cursor?: Sequence
  order: Order
  schemas: Schema[]
}
