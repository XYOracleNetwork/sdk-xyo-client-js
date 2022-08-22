import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'
export const XyoPayloadDivinerQueryPayloadSchema: XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'

export type XyoPayloadDivinerQueryPayload = XyoQueryPayload<{
  address: string
  schema: XyoPayloadDivinerQueryPayloadSchema
  huri: string
}>
