import { ZERO_ADDRESS } from '@xylabs/sdk-js'
import type { AddressPayload } from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'

export const addressPayloadTemplate = (): AddressPayload => ({
  address: ZERO_ADDRESS,
  schema: AddressSchema,
})
