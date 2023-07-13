import { Query } from '@xyo-network/payload-model'

export type BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'
export const BridgeDisconnectQuerySchema: BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'

export type BridgeDisconnectQuery = Query<{
  schema: BridgeDisconnectQuerySchema
  uri?: string
}>
