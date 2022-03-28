import { Parser } from 'bowser'

import { XyoPayload } from '../../core'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}
