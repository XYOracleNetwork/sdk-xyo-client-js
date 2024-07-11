import { Payload } from '@xyo-network/payload-model'

import { SchemaSchema } from './Schema.js'

export type SchemaPayload = Payload<{
  definition: {
    [key: string]: unknown
    $id?: string
  }
  extends?: string
  /** @deprecated use definition.$id instead */
  name?: string

  schema: SchemaSchema
}>
