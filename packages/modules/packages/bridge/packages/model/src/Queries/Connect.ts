import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const BridgeConnectQuerySchema = asSchema('network.xyo.query.bridge.connect', true)
export type BridgeConnectQuerySchema = typeof BridgeConnectQuerySchema

export type BridgeConnectQuery = Query<{
  id?: ModuleIdentifier
  maxDepth?: number
  schema: BridgeConnectQuerySchema
}>
