import { Query } from '@xyo-network/module-model'

export type XyoNodeRegisteredQuerySchema = 'network.xyo.query.node.registered'
export const XyoNodeRegisteredQuerySchema: XyoNodeRegisteredQuerySchema = 'network.xyo.query.node.registered'

export type XyoNodeRegisteredQuery = Query<{
  schema: XyoNodeRegisteredQuerySchema
}>
