import type { Address } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import {
  asSchema, isPayloadOfSchemaType, type Payload,
} from '@xyo-network/payload-model'

export const AddressSchema = asSchema('network.xyo.address', true)
export type AddressSchema = typeof AddressSchema

export const AddressChildSchema = asSchema('network.xyo.address.child', true)
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
