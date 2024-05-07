import { ModuleIdentifier } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

export type NodeDetachQuerySchema = 'network.xyo.query.node.detach'
export const NodeDetachQuerySchema: NodeDetachQuerySchema = 'network.xyo.query.node.detach'

export type NodeDetachQuery = Query<{
  id: ModuleIdentifier
  schema: NodeDetachQuerySchema
}>
