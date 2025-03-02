import type { Address } from '@xylabs/hex'
import { AsObjectFactory } from '@xylabs/object'
import { isPayloadOfSchemaType, type Payload } from '@xyo-network/payload-model'

export const AddressSchema = 'network.xyo.address' as const
export type AddressSchema = typeof AddressSchema

export const AddressChildSchema = 'network.xyo.address.child' as const
export type AddressChildSchema = typeof AddressChildSchema

export interface AddressFields {
  address: Address
}

export type AddressPayload = Payload<AddressFields, AddressSchema>

/**
 * Identity function for determining if an object is an Address
 */
export const isAddressPayload = isPayloadOfSchemaType<AddressPayload>(AddressSchema)
export const asAddressPayload = AsObjectFactory.create(isAddressPayload)
export const asOptionalAddressPayload = AsObjectFactory.createOptional(isAddressPayload)

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
