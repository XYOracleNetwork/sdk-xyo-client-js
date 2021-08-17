//Should type as JSONSchemaType<XyoBoundWitnessBody> once ajv/eslint issue is fixed
//https://github.com/microsoft/TypeScript/issues/44851
const XyoBoundWitnessBodySchema = {
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
