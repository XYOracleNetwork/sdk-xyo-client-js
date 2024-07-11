import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { IdPayload } from './Payload.js'
import { IdSchema } from './Schema.js'
import { idPayloadTemplate } from './Template.js'

export const IdPayloadPlugin = () =>
  createPayloadPlugin<IdPayload>({
    schema: IdSchema,
    template: idPayloadTemplate,
  })
