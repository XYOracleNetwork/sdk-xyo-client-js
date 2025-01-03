import type { Query } from '@xyo-network/payload-model'

export const NodeAttachedQuerySchema = 'network.xyo.query.node.attached' as const
export type NodeAttachedQuerySchema = typeof NodeAttachedQuerySchema

export type NodeAttachedQuery = Query<{
  schema: NodeAttachedQuerySchema
}>
