import { Query } from '@xyo-network/payload-model'

export const BridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export type BridgeConnectQuerySchema = typeof BridgeConnectQuerySchema

export type BridgeConnectQuery = Query<{
  schema: BridgeConnectQuerySchema
  uri?: string
}>
