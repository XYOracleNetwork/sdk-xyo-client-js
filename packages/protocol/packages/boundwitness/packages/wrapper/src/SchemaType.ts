import {
  Address, Hash, Hex,
} from '@xylabs/hex'
// import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { Schema, SchemaRegEx } from '@xyo-network/payload-model'
// import { payloadJsonSchema } from '@xyo-network/payload-wrapper'
import { JSONSchemaType } from 'ajv'

export const hexJsonSchema: JSONSchemaType<Hex> = {
  type: 'string',
  pattern: '^[a-fA-F0-9]+$',
  description: 'A general hex string not prefixed with 0x',
}

export const addressJsonSchema: JSONSchemaType<Address> = {
  type: 'string',
  pattern: '^[a-fA-F0-9]{20}$',
  description: 'A general address string not prefixed with 0x',
}

export const hashJsonSchema: JSONSchemaType<Hash> = {
  type: 'string',
  pattern: '^[a-fA-F0-9]{32}$',
  description: 'A general hash string not prefixed with 0x',
}

export const schemaJsonSchema: JSONSchemaType<Schema> = {
  type: 'string',
  pattern: SchemaRegEx,
  description: 'An XYO Schema String',
}

/*
export const boundWitnessJsonSchema: JSONSchemaType<Omit<BoundWitness, 'block' | 'chain' | 'root' |
  'schema' | '$sources' | '$opCodes' | '$destination' | '$sourceQuery'> & { schema: string }> = {
  ...payloadJsonSchema,
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  $defs: {
    Hex: hexJsonSchema, Address: addressJsonSchema, Hash: hashJsonSchema, Schema: schemaJsonSchema,
  },
  additionalProperties: false,
  properties: {
    addresses: { items: { type: 'string' }, type: 'array' },
    block: '#/$defs/Hex',
    chain: '#/$defs/Address',
    payload_hashes: { items: { type: 'string' }, type: 'array' },
    payload_schemas: { items: { type: 'string' }, type: 'array' },
    previous_hashes: { items: { nullable: true, type: 'string' }, type: 'array' },
    root: '#/$defs/Hash',
    schema: '#/$defs/Schema',
    $destination: { items: { type: 'string' }, type: 'array' },
    $sourceQuery: '#/$defs/Hash',
    $sources: { items: '#/$defs/Hash', type: 'array' },
    $opCodes: { items: { type: 'string' }, type: 'array' },
    $signatures: { items: { type: 'string' }, type: 'array' },
  },
  required: ['schema', 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}
  */
