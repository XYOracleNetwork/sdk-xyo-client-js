import type { ModuleIdentifier } from '@xyo-network/module-model'
import type { Query } from '@xyo-network/payload-model'

export type NodeAttachQuerySchema = 'network.xyo.query.node.attach'
export const NodeAttachQuerySchema: NodeAttachQuerySchema = 'network.xyo.query.node.attach'

export type NodeAttachQuery = Query<{
  external?: boolean
  id: ModuleIdentifier
  schema: NodeAttachQuerySchema
}>
