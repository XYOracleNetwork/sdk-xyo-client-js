import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoSchemaPayload } from './Payload'
import { XyoSchemaSchema } from './Schema'
import { schemaPayloadTemplate } from './Template'

export const SchemaPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoSchemaPayload>({
    schema: XyoSchemaSchema,
    template: schemaPayloadTemplate,
  })
