import { Query } from '@xyo-network/module-model'

export type XyoBridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export const XyoBridgeConnectQuerySchema: XyoBridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'

export type XyoBridgeConnectQuery = Query<{
  schema: XyoBridgeConnectQuerySchema
  uri?: string
}>
