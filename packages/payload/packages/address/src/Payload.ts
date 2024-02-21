import { Address } from '@xylabs/hex'
import { Payload } from '@xyo-network/payload-model'

import { AddressSchema } from './Schema'

export type AddressPayload = Payload<{
  address: Address
  name?: string
  schema: AddressSchema
}>
