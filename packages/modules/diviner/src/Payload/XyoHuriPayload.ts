import { XyoPayload } from '@xyo-network/payload'

export type XyoHuriPayloadSchema = 'network.xyo.huri'
export const XyoHuriPayloadSchema: XyoHuriPayloadSchema = 'network.xyo.huri'

export type XyoHuriPayload = XyoPayload<{
  schema: 'network.xyo.huri'
  huri: string
}>
