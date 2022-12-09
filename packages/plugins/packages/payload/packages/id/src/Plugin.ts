import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { IdPayload } from './Payload'
import { IdSchema } from './Schema'
import { idPayloadTemplate } from './Template'

export const IdPayloadPlugin = () =>
  createXyoPayloadPlugin<IdPayload>({
    schema: IdSchema,
    template: idPayloadTemplate,
  })
