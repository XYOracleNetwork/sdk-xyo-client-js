import { XyoSchemaPayload } from '@xyo-network/payload'
export const schemaTemplate = (): XyoSchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: 'network.xyo.schema',
})
