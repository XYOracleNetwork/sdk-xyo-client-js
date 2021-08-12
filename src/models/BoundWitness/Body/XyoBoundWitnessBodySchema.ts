import type { JSONSchemaType } from 'ajv'

import XyoBoundWitnessBody from './XyoBoundWitnessBody'

const XyoBoundWitnessBodySchema: JSONSchemaType<XyoBoundWitnessBody> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness/body',
  additionalProperties: false,
  properties: {
    addresses: { items: { type: 'string' }, type: 'array' },
    payload_hashes: { items: { type: 'string' }, type: 'array' },
    payload_schemas: { items: { type: 'string' }, type: 'array' },
    previous_hashes: { items: { nullable: true, type: 'string' }, type: 'array' },
  },
  required: ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}

export default XyoBoundWitnessBodySchema
