//Should type as JSONSchemaType<XyoBoundWitnessMeta> once ajv/eslint issue is fixed
//https://github.com/microsoft/TypeScript/issues/44851

/** @deprecated - meta fields not supported by client anymore */
export const XyoBoundWitnessMetaSchemaProperties = () => {
  return {
    _archive: { nullable: true, type: 'string' },
    _client: { nullable: true, type: 'string' },
    _hash: { nullable: true, type: 'string' },
    _payloads: { items: { type: 'object' }, nullable: true, type: 'array' },
    _signatures: { items: { type: 'string' }, nullable: true, type: 'array' },
    _source_ip: { nullable: true, type: 'string' },
    _timestamp: { nullable: true, type: 'number' },
    _user_agent: { nullable: true, type: 'string' },
  }
}

/** @deprecated - meta fields not supported by client anymore */
export const XyoBoundWitnessMetaSchema = () => {
  return {
    $id: 'https://schemas.xyo.network/2.0/boundwitness/meta',
    additionalProperties: false,
    // eslint-disable-next-line deprecation/deprecation
    properties: XyoBoundWitnessMetaSchemaProperties,
    type: 'object',
  }
}
