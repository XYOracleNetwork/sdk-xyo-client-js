import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const NodeCertifyQuerySchema = asSchema('network.xyo.query.node.certify', true)
export type NodeCertifyQuerySchema = typeof NodeCertifyQuerySchema

export type NodeCertifyQuery = Query<{
  id: ModuleIdentifier
  schema: NodeCertifyQuerySchema
}>
