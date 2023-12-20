import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { AddressPayload } from './Payload'
import { AddressSchema } from './Schema'
import { addressPayloadTemplate } from './Template'

export const AddressPayloadPlugin = () =>
  createPayloadPlugin<AddressPayload>({
    schema: AddressSchema,
    template: addressPayloadTemplate,
  })
