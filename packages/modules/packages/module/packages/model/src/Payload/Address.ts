import type { Address } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'

export const AddressSchema = 'network.xyo.address' as const
export type AddressSchema = typeof AddressSchema

export const AddressChildSchema = 'network.xyo.address.child' as const
export type AddressChildSchema = typeof AddressChildSchema

export interface AddressFields {
  address: Address
}

export type AddressPayload = Payload<AddressFields, AddressSchema>

export interface AddressChildFields extends AddressFields {
  /**
   * The derivation path of the child address
   */
  path?: string
  /**
   * The public address of the root of the hierarchy
   */
  root?: Address
}

export type AddressChildPayload = Payload<AddressChildFields, AddressChildSchema>
