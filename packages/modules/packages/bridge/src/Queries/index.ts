import { XyoModuleQuery, XyoModuleQuerySchema } from '@xyo-network/module'

import { XyoBridgeConnectQuery, XyoBridgeConnectQuerySchema } from './Connect'
import { XyoBridgeDisconnectQuery, XyoBridgeDisconnectQuerySchema } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type XyoBridgeQuery = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery | XyoModuleQuery

export type XyoBridgeQuerySchema = XyoBridgeConnectQuerySchema | XyoBridgeDisconnectQuerySchema | XyoModuleQuerySchema
