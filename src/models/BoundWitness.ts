//XyoBoundWitnessJson is an envelope for a payload
//addesses are the addresses of the witnesses
//signatures are the signature of the witnesses
//hashes are the previous block hashes for each witness
//the number of addresses and signatures must match
//the _hash is the hash of the payload and addresses together
//the _signatures sign the hash

//note: we always use SHA256 hash

import type { JSONSchemaType } from 'ajv'

interface XyoBoundWitnessMetaJson {
  _client?: string
  _hash?: string
  _payloads?: Record<string, any>[]
  _signatures?: string[]
}

interface XyoBoundWitnessBodyJson {
  addresses: string[]
  payload_hashes: string[]
  payload_schemas: string[]
  previous_hashes: (string | null)[]
}

type WithXyoBoundWitnessMeta<T extends XyoBoundWitnessBodyJson> = T & XyoBoundWitnessMetaJson

type XyoBoundWitnessJson = WithXyoBoundWitnessMeta<XyoBoundWitnessBodyJson>

const XyoBoundWitnessMetaSchema: JSONSchemaType<XyoBoundWitnessMetaJson> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness/meta',
  additionalProperties: false,
  properties: {
    _client: { nullable: true, type: 'string' },
    _hash: { nullable: true, type: 'string' },
    _payloads: { items: { type: 'object' }, nullable: true, type: 'array' },
    _signatures: { items: { type: 'string' }, nullable: true, type: 'array' },
  },
  type: 'object',
}

const XyoBoundWitnessBodySchema: JSONSchemaType<XyoBoundWitnessBodyJson> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness/body',
  additionalProperties: false,
  properties: {
    addresses: { items: { type: 'string' }, type: 'array' },
    payload_hashes: { items: { type: 'string' }, type: 'array' },
    payload_schemas: { items: { type: 'string' }, type: 'array' },
    previous_hashes: { items: { type: 'string' }, type: 'array' },
  },
  required: ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}

const XyoBoundWitnessSchema: JSONSchemaType<XyoBoundWitnessJson> = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness',
  additionalProperties: false,
  properties: {
    _client: { nullable: true, type: 'string' },
    _hash: { nullable: true, type: 'string' },
    _payloads: { items: { type: 'object' }, nullable: true, type: 'array' },
    _signatures: { items: { type: 'string' }, nullable: true, type: 'array' },
    addresses: { items: { type: 'string' }, type: 'array' },
    payload_hashes: { items: { type: 'string' }, type: 'array' },
    payload_schemas: { items: { type: 'string' }, type: 'array' },
    previous_hashes: { items: { type: 'string' }, type: 'array' },
  },
  required: ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'],
  type: 'object',
}

export { XyoBoundWitnessBodySchema, XyoBoundWitnessMetaSchema, XyoBoundWitnessSchema }

export type { WithXyoBoundWitnessMeta, XyoBoundWitnessBodyJson, XyoBoundWitnessJson, XyoBoundWitnessMetaJson }
