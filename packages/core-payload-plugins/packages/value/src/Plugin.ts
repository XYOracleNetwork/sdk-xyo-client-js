import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { Value } from './Payload.js'
import { ValueSchema } from './Schema.js'
import { valuePayloadTemplate } from './Template.js'

export const ValuePayloadPlugin = () =>
  createPayloadPlugin<Value>({
    schema: ValueSchema,
    template: valuePayloadTemplate,
  })
