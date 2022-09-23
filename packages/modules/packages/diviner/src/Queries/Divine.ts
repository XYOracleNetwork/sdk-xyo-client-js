import { XyoQuery } from '@xyo-network/module'
import { XyoPayloads } from '@xyo-network/payload'

export type XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'
export const XyoDivinerDivineQuerySchema: XyoDivinerDivineQuerySchema = 'network.xyo.query.diviner.divine'

export type XyoDivinerDivineQuery = XyoQuery<{
  schema: XyoDivinerDivineQuerySchema
  context?: string
  payloads?: XyoPayloads
}>
