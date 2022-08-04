import { XyoPayload } from '@xyo-network/payload'

export type XyoPayloadDivinerPayloadSchema = 'network.xyo.diviner.payload'
export const XyoPayloadDivinerPayloadSchema: XyoPayloadDivinerPayloadSchema = 'network.xyo.diviner.payload'

export type XyoPayloadDivinerPayload<T extends XyoPayload = XyoPayload> = XyoPayload<{
  schema: XyoPayloadDivinerPayloadSchema
  /** @field payload returned or null */
  payload: T | null
  /** @field duration of the call in ms */
  duration?: number
}>
