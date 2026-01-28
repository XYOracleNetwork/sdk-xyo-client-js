import type { Address } from '@xylabs/sdk-js'
import { asSchema, type Payload } from '@xyo-network/payload-model'

export const AddressPreviousHashSchema = asSchema('network.xyo.address.hash.previous', true)
export type AddressPreviousHashSchema = typeof AddressPreviousHashSchema

export type AddressPreviousHashPayload = Payload<
  {
    address: Address
    previousHash?: string
  },
  AddressPreviousHashSchema
>
