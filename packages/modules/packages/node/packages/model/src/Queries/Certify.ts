import { ModuleIdentifier } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

export const NodeCertifyQuerySchema = 'network.xyo.query.node.certify' as const
export type NodeCertifyQuerySchema = typeof NodeCertifyQuerySchema

export type NodeCertifyQuery = Query<{
  id: ModuleIdentifier
  schema: NodeCertifyQuerySchema
}>
