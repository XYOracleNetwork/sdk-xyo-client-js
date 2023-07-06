import { AddressSchema } from '@xyo-network/address-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

export const AddressPreviousHashSchema = `${AddressSchema}.hash.previous`
export type AddressPreviousHashSchema = typeof AddressPreviousHashSchema

export type AddressPreviousHashPayload = Payload<{
  address: string
  previousHash?: string
  schema: AddressPreviousHashSchema
}>
