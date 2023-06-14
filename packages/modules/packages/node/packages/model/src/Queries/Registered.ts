import { Query } from '@xyo-network/module-model'

export type NodeRegisteredQuerySchema = 'network.xyo.query.node.registered'
export const NodeRegisteredQuerySchema: NodeRegisteredQuerySchema = 'network.xyo.query.node.registered'

export type NodeRegisteredQuery = Query<{
  schema: NodeRegisteredQuerySchema
}>
