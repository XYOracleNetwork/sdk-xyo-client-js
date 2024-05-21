import { Address } from '@xylabs/hex'
import { Payload } from '@xyo-network/payload-model'

import { AddressSchema } from './Schema'

export interface AddressFields {
  address: Address
}

export type AddressPayload = Payload<AddressFields, AddressSchema>
