import { XyoPayload } from '../../core'

export interface XyoSchemaPayload extends XyoPayload {
  name: string
  definition: Record<string, unknown>
}
