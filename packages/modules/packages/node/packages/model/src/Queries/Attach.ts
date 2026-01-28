import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const NodeAttachQuerySchema = asSchema('network.xyo.query.node.attach', true)
export type NodeAttachQuerySchema = typeof NodeAttachQuerySchema

export type NodeAttachQuery = Query<{
  external?: boolean
  id: ModuleIdentifier
  schema: NodeAttachQuerySchema
}>
