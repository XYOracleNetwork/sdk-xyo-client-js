import { Address } from '@xylabs/hex'
import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const AddressPreviousHashSchema = `${AddressSchema}.hash.previous`
export type AddressPreviousHashSchema = typeof AddressPreviousHashSchema

export type AddressPreviousHashPayload = Payload<{
  address: Address
  previousHash?: string
  schema: AddressPreviousHashSchema
}>
