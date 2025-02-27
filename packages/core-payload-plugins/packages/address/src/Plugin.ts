import type { AddressPayload } from '@xyo-network/module-model'
import { AddressSchema } from '@xyo-network/module-model'
import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { addressPayloadTemplate } from './Template.ts'

export const AddressPayloadPlugin = () =>
  createPayloadPlugin<AddressPayload>({
    schema: AddressSchema,
    template: addressPayloadTemplate,
  })
