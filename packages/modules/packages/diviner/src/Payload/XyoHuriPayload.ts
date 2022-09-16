import { XyoPayload } from '@xyo-network/payload'

export type XyoHuriSchema = 'network.xyo.huri'
export const XyoHuriSchema: XyoHuriSchema = 'network.xyo.huri'

export type XyoHuriPayload = XyoPayload<{
  schema: 'network.xyo.huri'
  huri: string
}>
