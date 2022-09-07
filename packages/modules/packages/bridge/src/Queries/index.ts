import { XyoBridgeConnectQuery, XyoBridgeConnectQuerySchema } from './Connect'
import { XyoBridgeDisconnectQuery, XyoBridgeDisconnectQuerySchema } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type XyoBridgeQuery = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery

export type XyoBridgeQuerySchema = XyoBridgeConnectQuerySchema | XyoBridgeDisconnectQuerySchema
