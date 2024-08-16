import type { SchemaPayload } from './Payload.ts'
import { SchemaSchema } from './Schema.ts'
export const schemaPayloadTemplate = (): SchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: SchemaSchema,
})
