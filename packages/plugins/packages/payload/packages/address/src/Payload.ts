import { XyoPayload } from '@xyo-network/payload-model'

import { AddressSchema } from './Schema'

export type AddressPayload = XyoPayload<{
  address: string
  alias?: string
  schema: AddressSchema
}>
