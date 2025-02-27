import type {
  Address, Hash, Hex,
} from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import type { Schema } from '@xyo-network/payload-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import { payloadJsonSchema } from '@xyo-network/payload-wrapper'
import type { JSONSchemaType } from 'ajv'

export const hexJsonSchema: JSONSchemaType<Hex> = {
  type: 'string',
  pattern: '^[a-fA-F0-9]+$',
  description: 'A general hex string not prefixed with 0x',
}

export const addressJsonSchema: JSONSchemaType<Address> = {
  type: 'string',
  pattern: '^[a-f0-9]{20}$',
  description: 'A general address string not prefixed with 0x',
}

export const hashJsonSchema: JSONSchemaType<Hash> = {
  type: 'string',
  pattern: '^[a-f0-9]{32}$',
  description: 'A general hash string not prefixed with 0x',
}

export const schemaJsonSchema: JSONSchemaType<Schema> = {
  type: 'string',
  pattern: SchemaRegEx,
  description: 'An XYO Schema String',
}

export const boundWitnessJsonSchema: JSONSchemaType<BoundWitness> = {
  ...payloadJsonSchema,
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  $defs: {
    Hex: hexJsonSchema, Address: addressJsonSchema, Hash: hashJsonSchema, Schema: schemaJsonSchema,
  },
  additionalProperties: false,
  properties: {
    ...payloadJsonSchema.properties,
    addresses: { items: { type: '#/$defs/Schema' }, type: 'array' },
    block: { type: 'number' },
    chain: '#/$defs/Address',
    payload_hashes: { items: { type: '#/$defs/Hash' }, type: 'array' },
    payload_schemas: { items: { type: '#/$defs/Schema' }, type: 'array' },
    previous_hashes: { items: { type: '#/$defs/Hash' }, type: 'array' },
    root: '#/$defs/Hash',
    $destination: { items: { type: 'string' }, type: 'array' },
    $sourceQuery: '#/$defs/Hash',
    $sources: { items: '#/$defs/Hash', type: 'array' },
    $opCodes: { items: { type: 'string' }, type: 'array' },
    $signatures: { items: { type: 'string' }, type: 'array' },
  },
  required: [...payloadJsonSchema.required, 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}
