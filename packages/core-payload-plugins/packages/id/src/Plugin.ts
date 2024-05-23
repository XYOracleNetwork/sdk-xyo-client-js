import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { IdPayload } from './Payload'
import { IdSchema } from './Schema'
import { idPayloadTemplate } from './Template'

export const IdPayloadPlugin = () =>
  createPayloadPlugin<IdPayload>({
    schema: IdSchema,
    template: idPayloadTemplate,
  })
