import { Query } from '@xyo-network/module-model'

export type XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'
export const XyoNodeDetachQuerySchema: XyoNodeDetachQuerySchema = 'network.xyo.query.node.detach'

export type XyoNodeDetachQuery = Query<{
  nameOrAddress: string
  schema: XyoNodeDetachQuerySchema
}>
