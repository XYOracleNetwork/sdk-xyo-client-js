import { XyoQuery } from '@xyo-network/module'

export type XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'
export const XyoNodeDetachQuerySchema: XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'

export type XyoNodeDetachQuery = XyoQuery<{
  schema: XyoNodeDetachQuerySchema
  address: string
}>
