import { Payload } from '@xyo-network/payload-model'

export type XyoHuriSchema = 'network.xyo.huri'
export const XyoHuriSchema: XyoHuriSchema = 'network.xyo.huri'

export type XyoHuriPayload = Payload<{
  huri: string[]
  schema: 'network.xyo.huri'
  tokens?: string[]
}>
