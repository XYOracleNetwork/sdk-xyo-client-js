import { ModuleIdentifier } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

export const BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export type BridgeConnectQuerySchema = typeof BridgeConnectQuerySchema

export type BridgeConnectQuery = Query<{
  id?: ModuleIdentifier
  maxDepth?: number
  schema: BridgeConnectQuerySchema
}>
