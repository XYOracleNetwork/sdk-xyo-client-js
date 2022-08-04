import { XyoPayload } from '@xyo-network/payload'
import { Parser } from 'bowser'

export type XyoSystemInfoPayloadSchema = 'network.xyo.system.info'
export const XyoSystemInfoPayloadSchema = 'network.xyo.system.info'

export type XyoSystemInfoPayload = XyoPayload<{
  schema: XyoSystemInfoPayloadSchema
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}>
