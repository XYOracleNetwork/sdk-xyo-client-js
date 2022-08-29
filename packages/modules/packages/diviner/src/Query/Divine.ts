import { XyoQueryPayload } from '@xyo-network/module'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'

export type XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'
export const XyoDivinerDivineQuerySchema: XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'

export type XyoDivinerDivineQueryPayload<T extends XyoPayload = XyoPayload> = XyoQueryPayload<{
  schema: XyoDivinerDivineQuerySchema
  payloads?: XyoPayloads<T>
}>
