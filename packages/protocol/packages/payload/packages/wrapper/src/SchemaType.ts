import type { Payload } from '@xyo-network/payload-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import type { JSONSchemaType } from 'ajv'

export const HexRegEx = (minBytes = 0, maxBytes?: number) => {
  return `^[a-f0-9]{${minBytes * 2},${maxBytes ? minBytes * 2 : ''}}$`
}
export const HashRegEx = HexRegEx(32)
export const AddressRegEx = HexRegEx(20)
export const Uint256RegEx = HexRegEx(0, 32)

export const payloadPropertiesJsonSchema: JSONSchemaType<Payload>['properties'] = {
  $sources: {
    type: 'array',
    items: { type: 'string', pattern: HashRegEx },
    nullable: true,
  },
  $opCodes: {
    items: { type: 'string' }, type: 'array', nullable: true,
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
