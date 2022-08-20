import { XyoDivinerQueryPayload } from './Diviner'

export type XyoPayloadDivinerQuerySchema = 'network.xyo.diviner.payload.query'
export const XyoPayloadDivinerQuerySchema: XyoPayloadDivinerQuerySchema = 'network.xyo.diviner.payload.query'

export type XyoHuriPayloadDivinerQuery = XyoDivinerQueryPayload<
  XyoPayloadDivinerQuerySchema,
  {
    schema: XyoPayloadDivinerQuerySchema
    huri: string
  }
>
