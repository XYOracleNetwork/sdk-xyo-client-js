import type { JSONSchemaType } from 'ajv'

import XyoBoundWitnessMeta from './XyoBoundWitnessMeta'

const XyoBoundWitnessMetaSchema: JSONSchemaType<XyoBoundWitnessMeta> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness/meta',
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
  },
  type: 'object',
}

export default XyoBoundWitnessMetaSchema
