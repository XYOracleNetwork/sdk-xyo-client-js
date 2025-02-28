import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import {
  AddressRegEx, HashRegEx, HexRegEx, payloadJsonSchema,
} from '@xyo-network/payload-wrapper'
import type { JSONSchemaType } from 'ajv'

export const SignatureRegEx = HexRegEx(32)

export const boundWitnessJsonSchema: JSONSchemaType<BoundWitness> = {
  ...payloadJsonSchema,
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  additionalProperties: false,
  properties: {
    ...payloadJsonSchema.properties,
    addresses: { items: { type: 'string', pattern: AddressRegEx }, type: 'array' },
    payload_hashes: { items: { type: 'string', pattern: HashRegEx }, type: 'array' },
    payload_schemas: { items: { type: 'string', pattern: SchemaRegEx }, type: 'array' },
    previous_hashes: { items: { type: 'string', pattern: HashRegEx }, type: 'array' },
    root: { type: 'string', pattern: HashRegEx },
    $destination: { items: { type: 'string', pattern: HashRegEx }, type: 'array' },
    $sourceQuery: { type: 'string', pattern: HashRegEx },
    $sources: { items: { type: 'string', pattern: HashRegEx }, type: 'array' },
    $opCodes: { items: { type: 'string' }, type: 'array' },
    $signatures: { items: { type: 'string', pattern: SignatureRegEx }, type: 'array' },
  },
  required: [...payloadJsonSchema.required, 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}
