import { Query } from '@xyo-network/payload-model'

export type BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'
export const BridgeDisconnectQuerySchema: BridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'

export interface BridgeDisconnectQuery
  extends Query<{
    schema: BridgeDisconnectQuerySchema
    uri?: string
  }> {}
