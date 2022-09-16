import { XyoQuery } from '@xyo-network/module'

export type XyoNodeAvailableQuerySchema = 'network.xyo.query.node.available'
export const XyoNodeAvailableQuerySchema: XyoNodeAvailableQuerySchema = 'network.xyo.query.node.available'

export type XyoNodeAvailableQuery = XyoQuery<{
  schema: XyoNodeAvailableQuerySchema
}>
