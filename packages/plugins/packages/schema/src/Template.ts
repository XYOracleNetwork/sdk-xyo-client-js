import { XyoSchemaPayload } from '@xyo-network/payload'

import { XyoSchemaPayloadSchema } from './Schema'
export const XyoSchemaPayloadTemplate = (): XyoSchemaPayload => ({
  definition: {
    $id: '',
    $schema: 'http://json-schema.org/draft-07/schema#',
  },
  schema: XyoSchemaPayloadSchema,
})
