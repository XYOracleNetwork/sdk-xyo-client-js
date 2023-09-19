import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { ValuePayload } from './Payload'
import { ValueSchema } from './Schema'
import { valuePayloadTemplate } from './Template'

export const ValuePayloadPlugin = () =>
  createPayloadPlugin<ValuePayload>({
    schema: ValueSchema,
    template: valuePayloadTemplate,
  })
