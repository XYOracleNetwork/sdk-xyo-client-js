import { Query } from '@xyo-network/module-model'

export type XyoNodeAttachQuerySchema = 'network.xyo.query.node.attach'
export const XyoNodeAttachQuerySchema: XyoNodeAttachQuerySchema = 'network.xyo.query.node.attach'

export type XyoNodeAttachQuery = Query<{
  external?: boolean
  nameOrAddress: string
  schema: XyoNodeAttachQuerySchema
}>
