import { XyoPayload } from '@xyo-network/payload'

import { XyoSchemaPayloadSchema } from './Schema'

export type XyoSchemaPayload = XyoPayload<{
  schema: XyoSchemaPayloadSchema
  /** @deprecated use definition.$id instead */
  name?: string
  definition: {
    $id?: string
    [key: string]: unknown
  }
  extends?: string
}>
