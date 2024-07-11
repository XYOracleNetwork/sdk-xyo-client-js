import { AddressPayload, AddressSchema } from '@xyo-network/module-model'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { addressPayloadTemplate } from './Template.js'

export const AddressPayloadPlugin = () =>
  createPayloadPlugin<AddressPayload>({
    schema: AddressSchema,
    template: addressPayloadTemplate,
  })
