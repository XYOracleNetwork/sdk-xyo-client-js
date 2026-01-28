import { asSchema, type Query } from '@xyo-network/payload-model'

export const NodeAttachedQuerySchema = asSchema('network.xyo.query.node.attached', true)
export type NodeAttachedQuerySchema = typeof NodeAttachedQuerySchema

export type NodeAttachedQuery = Query<{
  schema: NodeAttachedQuerySchema
}>
