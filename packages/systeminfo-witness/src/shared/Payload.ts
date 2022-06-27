import { XyoPayload } from '@xyo-network/payload'
import { Parser } from 'bowser'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}
