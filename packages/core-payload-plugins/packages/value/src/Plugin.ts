import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { Value } from './Payload'
import { ValueSchema } from './Schema'
import { valuePayloadTemplate } from './Template'

export const ValuePayloadPlugin = () =>
  createPayloadPlugin<Value>({
    schema: ValueSchema,
    template: valuePayloadTemplate,
  })
