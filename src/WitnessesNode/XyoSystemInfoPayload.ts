import { XyoPayload } from '../models'

export interface XyoSystemInfoPayload extends XyoPayload {
  systeminformation?: Record<string, unknown>
}
