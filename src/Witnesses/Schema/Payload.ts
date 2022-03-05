import { XyoPayload } from '../../models'

export interface XyoSchemaPayload extends XyoPayload {
  name: string
  definition: Record<string, unknown>
}
