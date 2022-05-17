import { XyoSystemInfoPayload } from '../shared'

export interface XyoSystemInfoNodePayload extends XyoSystemInfoPayload {
  systeminformation?: Record<string, unknown>
}
