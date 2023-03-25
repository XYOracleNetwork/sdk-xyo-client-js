import { Query } from '@xyo-network/module-model'

export type XyoBridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'
export const XyoBridgeDisconnectQuerySchema: XyoBridgeDisconnectQuerySchema = 'network.xyo.query.bridge.disconnect'

export type XyoBridgeDisconnectQuery = Query<{
  schema: XyoBridgeDisconnectQuerySchema
  uri?: string
}>
