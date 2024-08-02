import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { SchemaPayload } from './Payload.ts'
import { SchemaSchema } from './Schema.ts'
import { schemaPayloadTemplate } from './Template.ts'

export const SchemaPayloadPlugin = () =>
  createPayloadPlugin<SchemaPayload>({
    schema: SchemaSchema,
    template: schemaPayloadTemplate,
  })
