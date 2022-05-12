import { XyoPayload } from '../Payload'

export interface XyoSchemaPayload extends XyoPayload {
  /** @deprecated use definition.$id instead */
  name?: string
  definition: {
    $id?: string
    [key: string]: unknown
  }
}
