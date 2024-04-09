import { ModuleIdentifier } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

export type BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'
export const BridgeDisconnectQuerySchema: BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'

export type BridgeDisconnectQuery = Query<{
  id?: ModuleIdentifier
  maxDepth?: number
  schema: BridgeDisconnectQuerySchema
}>
