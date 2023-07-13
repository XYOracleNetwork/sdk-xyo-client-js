import { Query } from '@xyo-network/payload-model'

export type NodeAttachedQuerySchema = 'network.xyo.query.node.attached'
export const NodeAttachedQuerySchema: NodeAttachedQuerySchema = 'network.xyo.query.node.attached'

export type NodeAttachedQuery = Query<{
  schema: NodeAttachedQuerySchema
}>
