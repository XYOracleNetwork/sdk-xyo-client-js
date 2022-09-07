import { XyoQuery } from '@xyo-network/module'

export type XyoNodeDetatchQuerySchema = 'network.xyo.query.node.detatch'
export const XyoNodeDetatchQuerySchema: XyoNodeDetatchQuerySchema = 'network.xyo.query.node.detatch'

export type XyoNodeDetatchQuery = XyoQuery<{
  schema: XyoNodeDetatchQuerySchema
  address: string
}>
