import type { Payload } from '@xyo-network/payload-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import type { JSONSchemaType } from 'ajv'

export const HexRegEx = (bytes?: number) => bytes ? `^[a-f0-9]{${bytes * 2}}$` : '^[a-f0-9]+$'
export const HashRegEx = HexRegEx(32)
export const AddressRegEx = HexRegEx(32)

export const payloadJsonSchema: JSONSchemaType<Payload> = {
  $id: 'https://schemas.xyo.network/2.0/payload',
  additionalProperties: true,
  properties: {
    $sources: {
      type: 'array',
      items: { type: 'string', pattern: HashRegEx },
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
