import { XyoQuery } from '@xyo-network/module'

export type XyoNodeRegisteredQuerySchema = 'network.xyo.query.node.registered'
export const XyoNodeRegisteredQuerySchema: XyoNodeRegisteredQuerySchema = 'network.xyo.query.node.registered'

export type XyoNodeRegisteredQuery = XyoQuery<{
  schema: XyoNodeRegisteredQuerySchema
}>
