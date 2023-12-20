import { SchemaPayload } from './Payload'
import { SchemaSchema } from './Schema'
export const schemaPayloadTemplate = (): SchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: SchemaSchema,
})
