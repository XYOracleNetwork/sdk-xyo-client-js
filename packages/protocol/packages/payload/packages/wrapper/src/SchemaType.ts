import { type Payload, SchemaRegEx } from '@xyo-network/payload-model'
import type { JSONSchemaType } from 'ajv'

export const payloadJsonSchema: JSONSchemaType<Payload> = {
  additionalProperties: true,
  properties: {
    $sources: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    $opCodes: {
      items: { type: 'string' }, type: 'array', nullable: true,
    },
    schema: { pattern: SchemaRegEx, type: 'string' },
  },
  required: ['schema'],
  type: 'object',
}
