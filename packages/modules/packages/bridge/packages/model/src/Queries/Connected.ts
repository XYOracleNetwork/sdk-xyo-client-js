import { Query } from '@xyo-network/payload-model'

export type BridgeConnectedQuerySchema = 'network.xyo.query.bridge.connected'
export const BridgeConnectedQuerySchema: BridgeConnectedQuerySchema = 'network.xyo.query.bridge.connected'

export type BridgeConnectedQuery = Query<{
  schema: BridgeConnectedQuerySchema
}>
