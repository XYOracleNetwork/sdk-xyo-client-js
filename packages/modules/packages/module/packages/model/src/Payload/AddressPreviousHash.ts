import type { Address } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export const AddressPreviousHashSchema = 'network.xyo.address.hash.previous' as const
export type AddressPreviousHashSchema = typeof AddressPreviousHashSchema

export type AddressPreviousHashPayload = Payload<
  {
    address: Address
    previousHash?: string
  },
  AddressPreviousHashSchema
>
