import { XyoPayload } from '@xyo-network/payload'
import { Parser } from 'bowser'

export type XyoSystemInfoPayloadSchema = 'network.xyo.system.info'
export const XyoSystemInfoPayloadSchema: XyoSystemInfoPayloadSchema = 'network.xyo.system.info'

export type XyoSystemInfoPayload<S extends string = XyoSystemInfoPayloadSchema, T extends XyoPayload = XyoPayload> = XyoPayload<
  {
    schema: S
    bowser?: Parser.ParsedResult
    systeminformation?: Record<string, unknown>
  } & T
>
