import { XyoPayload } from '../models'

export type XyoSchemaPayload = XyoPayload<{
  /** @deprecated use definition.$id instead */
  name?: string
  definition: {
    $id?: string
    [key: string]: unknown
  }
  extends?: string
}>
