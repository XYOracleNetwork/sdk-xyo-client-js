import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema, type Query } from '@xyo-network/payload-model'

export const BridgeDisconnectQuerySchema = asSchema('network.xyo.query.bridge.disconnect', true)
export type BridgeDisconnectQuerySchema = typeof BridgeDisconnectQuerySchema

export type BridgeDisconnectQuery = Query<{
  id?: ModuleIdentifier
  maxDepth?: number
  schema: BridgeDisconnectQuerySchema
}>
