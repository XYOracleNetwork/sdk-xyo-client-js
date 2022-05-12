import { XyoSystemInfoPayload } from '../../../Witnesses'

export interface XyoSystemInfoNodePayload extends XyoSystemInfoPayload {
  systeminformation?: Record<string, unknown>
}
