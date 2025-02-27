import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import type { Value } from './Payload.ts'
import { ValueSchema } from './Schema.ts'
import { valuePayloadTemplate } from './Template.ts'

export const ValuePayloadPlugin = () =>
  createPayloadPlugin<Value>({
    schema: ValueSchema,
    template: valuePayloadTemplate,
  })
