import { SchemaPayload } from './Payload.js'
import { SchemaSchema } from './Schema.js'
export const schemaPayloadTemplate = (): SchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: SchemaSchema,
})
