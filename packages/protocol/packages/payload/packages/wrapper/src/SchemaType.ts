import { Payload } from '@xyo-network/payload-model'
import { JSONSchemaType } from 'ajv'

const SchemaRegEx = '^((?!-)[a-z0-9-]{1, 63}(?<!-)\\.)+$'

export const payloadJsonSchema: JSONSchemaType<Payload> = {
  additionalProperties: true,
  properties: {
    $meta: { additionalProperties: true, nullable: true, required: [], type: 'object' },
    schema: { pattern: SchemaRegEx, type: 'string' },
  },
  required: ['schema'],
  type: 'object',
}
