import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { SchemaPayload } from './Payload.js'
import { SchemaSchema } from './Schema.js'
import { schemaPayloadTemplate } from './Template.js'

export const SchemaPayloadPlugin = () =>
  createPayloadPlugin<SchemaPayload>({
    schema: SchemaSchema,
    template: schemaPayloadTemplate,
  })
