import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'
export const XyoPayloadDivinerQueryPayloadSchema: XyoPayloadDivinerQueryPayloadSchema = 'network.xyo.diviner.payload.query'

export type XyoPayloadDivinerQueryPayload<T extends XyoPayload = XyoPayload> = XyoQueryPayload<
  {
    huri: string
  } & T
>
