import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const NodeDetachQuerySchema = asSchema('network.xyo.query.node.detach', true)
export type NodeDetachQuerySchema = typeof NodeDetachQuerySchema

export type NodeDetachQuery = Query<{
  id: ModuleIdentifier
  schema: NodeDetachQuerySchema
}>
