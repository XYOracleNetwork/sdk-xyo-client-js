import { XyoQuery } from '@xyo-network/module-model'

export type XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'
export const XyoNodeDetachQuerySchema: XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'

export type XyoNodeDetachQuery = XyoQuery<{
  address: string
  schema: XyoNodeDetachQuerySchema
}>
