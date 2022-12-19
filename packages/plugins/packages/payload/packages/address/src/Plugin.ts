import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { AddressPayload } from './Payload'
import { AddressSchema } from './Schema'
import { addressPayloadTemplate } from './Template'

export const AddressPayloadPlugin = () =>
  createXyoPayloadPlugin<AddressPayload>({
    schema: AddressSchema,
    template: addressPayloadTemplate,
  })
