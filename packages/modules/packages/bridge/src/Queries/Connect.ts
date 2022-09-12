import { XyoQuery } from '@xyo-network/module'

export type XyoBridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'
export const XyoBridgeConnectQuerySchema: XyoBridgeConnectQuerySchema = 'network.xyo.query.bridge.connect'

export type XyoBridgeConnectQuery = XyoQuery<{
  schema: XyoBridgeConnectQuerySchema
  uri?: string
}>
