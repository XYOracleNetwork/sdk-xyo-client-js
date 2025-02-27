import { Query } from '@xyo-network/payload-model'

export const NodeRegisteredQuerySchema = 'network.xyo.query.node.registered' as const
export type NodeRegisteredQuerySchema = typeof NodeRegisteredQuerySchema

export type NodeRegisteredQuery = Query<{
  schema: NodeRegisteredQuerySchema
}>
