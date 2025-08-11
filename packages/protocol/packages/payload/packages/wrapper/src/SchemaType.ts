import { HashRegEx, HexRegExMinMax } from '@xylabs/hex'
import type { Payload } from '@xyo-network/payload-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import type { JSONSchemaType } from 'ajv'

export const Uint256RegEx = HexRegExMinMax(0, 32)

export const payloadPropertiesJsonSchema: JSONSchemaType<Payload>['properties'] = {
  $sources: {
    type: 'array',
    items: { type: 'string', pattern: HashRegEx },
  },
  schema: { pattern: SchemaRegEx, type: 'string' },
}

export const payloadJsonSchema: JSONSchemaType<Payload> = {
  $id: 'https://schemas.xyo.network/2.0/payload',
  additionalProperties: true,
  properties: payloadPropertiesJsonSchema,
  required: ['schema'],
  type: 'object',
}
