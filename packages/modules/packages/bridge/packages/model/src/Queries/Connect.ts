import { Query } from '@xyo-network/module-model'

export type BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export const BridgeConnectQuerySchema: BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'

export type BridgeConnectQuery = Query<{
  schema: BridgeConnectQuerySchema
  uri?: string
}>
