import type { Payload } from '@xyo-network/payload-model'
import type { JSONSchemaType } from 'ajv'

const SchemaRegEx = String.raw`^((?!-)[a-z0-9-]{1, 63}(?<!-)\.)+$`

export const payloadJsonSchema: JSONSchemaType<Payload> = {
  additionalProperties: true,
  properties: {
    $sources: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    $chain: {
      properties: {
        ops: {
          items: { type: 'string' }, type: 'array', nullable: true,
        },
      },
      additionalProperties: true,
      nullable: true,
      required: [],
      type: 'object',
    },
    schema: { pattern: SchemaRegEx, type: 'string' },
  },
  required: ['schema'],
  type: 'object',
}
