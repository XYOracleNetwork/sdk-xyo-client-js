import { Parser } from 'bowser'

import { XyoPayload } from '../../models'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}
