import { ModuleIdentifier } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

export type NodeCertifyQuerySchema = 'network.xyo.query.node.certify'
export const NodeCertifyQuerySchema: NodeCertifyQuerySchema = 'network.xyo.query.node.certify'

export type NodeCertifyQuery = Query<{
  id: ModuleIdentifier
  schema: NodeCertifyQuerySchema
}>
