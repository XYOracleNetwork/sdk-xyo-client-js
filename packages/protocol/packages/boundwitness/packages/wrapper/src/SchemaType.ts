import {
  AddressRegEx, HashRegEx, HexRegExMinMax,
} from '@xylabs/hex'
import type { BoundWitness } from '@xyo-network/boundwitness-model'
import { SchemaRegEx } from '@xyo-network/payload-model'
import { payloadJsonSchema } from '@xyo-network/payload-wrapper'
import type { JSONSchemaType } from 'ajv'

export const SignatureRegEx = HexRegExMinMax(64, 64)

export const boundWitnessProperties: JSONSchemaType<BoundWitness>['properties'] = {
  ...payloadJsonSchema.properties,
  addresses: { items: { type: 'string', pattern: AddressRegEx.source }, type: 'array' },
  payload_hashes: { items: { type: 'string', pattern: HashRegEx.source }, type: 'array' },
  payload_schemas: { items: { type: 'string', pattern: SchemaRegEx.source }, type: 'array' },
  previous_hashes: {
    items: {
      type: 'string', pattern: HashRegEx.source, nullable: true,
    },
    type: 'array',
  },
  root: { type: 'string', pattern: HashRegEx.source },
  $destination: { items: { type: 'string', pattern: HashRegEx.source }, type: 'array' },
  $sourceQuery: { type: 'string', pattern: HashRegEx.source },
  $sources: { items: { type: 'string', pattern: HashRegEx.source }, type: 'array' },
  $signatures: { items: { type: 'string', pattern: SignatureRegEx.source }, type: 'array' },
}

export const boundWitnessJsonSchema: JSONSchemaType<BoundWitness> = {
  ...payloadJsonSchema,
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  additionalProperties: false,
  properties: boundWitnessProperties,
  required: [...payloadJsonSchema.required, 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}
