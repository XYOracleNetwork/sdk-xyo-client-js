import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import type { Id } from './Payload.ts'
import { IdSchema } from './Schema.ts'
import { idPayloadTemplate } from './Template.ts'

export const IdPayloadPlugin = () =>
  createPayloadPlugin<Id>({
    schema: IdSchema,
    template: idPayloadTemplate,
  })
