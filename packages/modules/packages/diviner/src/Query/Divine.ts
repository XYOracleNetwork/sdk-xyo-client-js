import { XyoQuery } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

export type XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'
export const XyoDivinerDivineQuerySchema: XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'

export type XyoDivinerDivineQuery<T extends XyoPayload = XyoPayload> = XyoQuery<{
  schema: XyoDivinerDivineQuerySchema
  payloads?: XyoPayloads<T>
}>
