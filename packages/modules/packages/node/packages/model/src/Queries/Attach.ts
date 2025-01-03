import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { Query } from '@xyo-network/payload-model'

export const NodeAttachQuerySchema = 'network.xyo.query.node.attach' as const
export type NodeAttachQuerySchema = typeof NodeAttachQuerySchema

export type NodeAttachQuery = Query<{
  external?: boolean
  id: ModuleIdentifier
  schema: NodeAttachQuerySchema
}>
