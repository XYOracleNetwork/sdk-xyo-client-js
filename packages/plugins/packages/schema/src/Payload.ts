import { XyoPayload } from '@xyo-network/payload'

import { XyoSchemaSchema } from './Schema'

export type XyoSchemaPayload = XyoPayload<{
  schema: XyoSchemaSchema
  /** @deprecated use definition.$id instead */
  name?: string
  definition: {
    $id?: string
    [key: string]: unknown
  }
  extends?: string
}>
