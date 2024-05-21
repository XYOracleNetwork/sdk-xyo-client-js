import { AddressPayload, AddressSchema } from '@xyo-network/module-model'

export const addressPayloadTemplate = (): AddressPayload => ({
  address: '',
  schema: AddressSchema,
})
