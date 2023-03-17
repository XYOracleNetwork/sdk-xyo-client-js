import { Payload } from '@xyo-network/payload-model'

import { XyoSchemaSchema } from './Schema'

export type XyoSchemaPayload = Payload<{
  definition: {
    [key: string]: unknown
    $id?: string
  }
  extends?: string
  /** @deprecated use definition.$id instead */
  name?: string

  schema: XyoSchemaSchema
}>
