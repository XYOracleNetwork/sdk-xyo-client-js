import { XyoPayload } from '@xyo-network/payload'

import { XyoSchemaSchema } from './Schema'

export type XyoSchemaPayload = XyoPayload<{
  definition: {
    [key: string]: unknown
    $id?: string
  }
  extends?: string
  /** @deprecated use definition.$id instead */
  name?: string

  schema: XyoSchemaSchema
}>
