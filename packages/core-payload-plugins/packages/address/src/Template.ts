import { AddressPayload } from './Payload'
import { AddressSchema } from './Schema'

export const addressPayloadTemplate = (): AddressPayload => ({
  address: '',
  schema: AddressSchema,
})
