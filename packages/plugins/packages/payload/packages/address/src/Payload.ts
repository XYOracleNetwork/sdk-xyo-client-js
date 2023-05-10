import { Payload } from '@xyo-network/payload-model'

import { AddressSchema } from './Schema'

export type AddressPayload = Payload<{
  address: string
  name?: string
  previousHash?: string
  schema: AddressSchema
}>
