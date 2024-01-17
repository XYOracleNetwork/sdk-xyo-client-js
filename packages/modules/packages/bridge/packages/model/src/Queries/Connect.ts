import { Query } from '@xyo-network/payload-model'

export type BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export const BridgeConnectQuerySchema: BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'

export interface BridgeConnectQuery
  extends Query<{
    schema: BridgeConnectQuerySchema
    uri?: string
  }> {}
