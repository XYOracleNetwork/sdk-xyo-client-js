import { HuriOptions } from '@xyo-network/payload'

import { XyoDivinerQueryPayload } from '../../Diviner'

export type XyoHuriPayloadDivinerQuerySchema = 'network.xyo.diviner.payload.huri.query'
export const XyoHuriPayloadDivinerQuerySchema: XyoHuriPayloadDivinerQuerySchema = 'network.xyo.diviner.payload.huri.query'

export type XyoHuriPayloadDivinerQuery = XyoDivinerQueryPayload<{
  schema: XyoHuriPayloadDivinerQuerySchema
  options?: HuriOptions
  huri: string
}>
