import { XyoPayload } from '@xyo-network/core'
import { Parser } from 'bowser'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}
