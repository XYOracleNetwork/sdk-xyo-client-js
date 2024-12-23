import type { Address } from '@xylabs/hex'
import type { Order } from '@xyo-network/diviner-payload-model'
import type { Schema, Sequence } from '@xyo-network/payload-model'

export interface PayloadSearchCriteria {
  addresses: Address[]
  cursor?: Sequence
  order: Order
  schemas: Schema[]
}
