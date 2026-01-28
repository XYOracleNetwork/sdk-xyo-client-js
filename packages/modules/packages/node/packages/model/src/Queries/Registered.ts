import { asSchema, type Query } from '@xyo-network/payload-model'

export const NodeRegisteredQuerySchema = asSchema('network.xyo.query.node.registered', true)
export type NodeRegisteredQuerySchema = typeof NodeRegisteredQuerySchema

export type NodeRegisteredQuery = Query<{
  schema: NodeRegisteredQuerySchema
}>
