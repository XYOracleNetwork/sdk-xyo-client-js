import type { Query } from '@xyo-network/payload-model'

export type NodeRegisteredQuerySchema = 'network.xyo.query.node.registered'
export const NodeRegisteredQuerySchema: NodeRegisteredQuerySchema = 'network.xyo.query.node.registered'

export type NodeRegisteredQuery = Query<{
  schema: NodeRegisteredQuerySchema
}>
