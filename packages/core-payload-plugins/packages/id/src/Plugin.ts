import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import type { IdPayload } from './Payload.ts'
import { IdSchema } from './Schema.ts'
import { idPayloadTemplate } from './Template.ts'

export const IdPayloadPlugin = () =>
  createPayloadPlugin<IdPayload>({
    schema: IdSchema,
    template: idPayloadTemplate,
  })
