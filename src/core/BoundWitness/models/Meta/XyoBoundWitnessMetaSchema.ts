//Should type as JSONSchemaType<XyoBoundWitnessMeta> once ajv/eslint issue is fixed
//https://github.com/microsoft/TypeScript/issues/44851

export const XyoBoundWitnessMetaSchemaProperties = {
  _archive: { nullable: true, type: 'string' },
  _client: { nullable: true, type: 'string' },
  _hash: { nullable: true, type: 'string' },
  _payloads: { items: { type: 'object' }, nullable: true, type: 'array' },
  _signatures: { items: { type: 'string' }, nullable: true, type: 'array' },
  _source_ip: { nullable: true, type: 'string' },
  _timestamp: { nullable: true, type: 'number' },
  _user_agent: { nullable: true, type: 'string' },
}

export const XyoBoundWitnessMetaSchema = {
  $id: 'https://schemas.xyo.network/2.0/boundwitness/meta',
  additionalProperties: false,
  properties: XyoBoundWitnessMetaSchemaProperties,
  type: 'object',
}
