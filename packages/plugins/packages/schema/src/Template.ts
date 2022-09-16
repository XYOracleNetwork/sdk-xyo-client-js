import { XyoSchemaPayload } from './Payload'
import { XyoSchemaSchema } from './Schema'
export const XyoSchemaPayloadTemplate = (): XyoSchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: XyoSchemaSchema,
})
