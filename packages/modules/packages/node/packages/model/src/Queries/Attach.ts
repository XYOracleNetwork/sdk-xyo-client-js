import { Query } from '@xyo-network/payload-model'

export type NodeAttachQuerySchema = 'network.xyo.query.node.attach'
export const NodeAttachQuerySchema: NodeAttachQuerySchema = 'network.xyo.query.node.attach'

export type NodeAttachQuery = Query<{
  external?: boolean
  nameOrAddress: string
  schema: NodeAttachQuerySchema
}>
