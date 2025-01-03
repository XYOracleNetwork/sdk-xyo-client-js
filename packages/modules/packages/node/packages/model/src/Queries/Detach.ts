import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { Query } from '@xyo-network/payload-model'

export const NodeDetachQuerySchema = 'network.xyo.query.node.detach' as const
export type NodeDetachQuerySchema = typeof NodeDetachQuerySchema

export type NodeDetachQuery = Query<{
  id: ModuleIdentifier
  schema: NodeDetachQuerySchema
}>
