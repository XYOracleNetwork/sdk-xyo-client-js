import { JSONSchemaType } from 'ajv'

import XyoBoundWitness from './XyoBoundWitness'

const XyoBoundWitnessSchema: JSONSchemaType<XyoBoundWitness> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  additionalProperties: false,
  properties: {
    _archive: { nullable: true, type: 'string' },
    _client: { nullable: true, type: 'string' },
    _hash: { nullable: true, type: 'string' },
    _payloads: { items: { type: 'object' }, nullable: true, type: 'array' },
    _signatures: { items: { type: 'string' }, nullable: true, type: 'array' },
    _source_ip: { nullable: true, type: 'string' },
    _timestamp: { nullable: true, type: 'number' },
    _user_agent: { nullable: true, type: 'string' },
    addresses: { items: { type: 'string' }, type: 'array' },
    payload_hashes: { items: { type: 'string' }, type: 'array' },
    payload_schemas: { items: { type: 'string' }, type: 'array' },
    previous_hashes: { items: { nullable: true, type: 'string' }, type: 'array' },
  },
  required: ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}

export default XyoBoundWitnessSchema
