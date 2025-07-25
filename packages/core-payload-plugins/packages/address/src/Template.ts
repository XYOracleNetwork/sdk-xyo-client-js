import { ZERO_ADDRESS } from '@xylabs/hex'
import type { AddressPayload } from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'

export const addressPayloadTemplate = (): AddressPayload => ({
  address: ZERO_ADDRESS,
  schema: AddressSchema,
})
