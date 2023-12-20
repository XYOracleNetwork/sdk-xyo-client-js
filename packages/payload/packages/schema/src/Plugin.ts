import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { SchemaPayload } from './Payload'
import { SchemaSchema } from './Schema'
import { schemaPayloadTemplate } from './Template'

export const SchemaPayloadPlugin = () =>
  createPayloadPlugin<SchemaPayload>({
    schema: SchemaSchema,
    template: schemaPayloadTemplate,
  })
