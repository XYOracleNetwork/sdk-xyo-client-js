import { XyoPayload } from '@xyo-network/payload'

import { AddressSchema } from './Schema'

export type AddressPayload = XyoPayload<{
  address: string
  schema: AddressSchema
}>
