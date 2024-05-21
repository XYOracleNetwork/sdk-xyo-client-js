import { Address } from '@xylabs/hex'
import { Payload } from '@xyo-network/payload-model'

import { AddressChildSchema, AddressSchema } from './Schema'

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
