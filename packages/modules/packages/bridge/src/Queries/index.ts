import { XyoModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoBridgeConnectQuery } from './Connect'
import { XyoBridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type XyoBridgeQueryBase = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery | XyoModuleQuery
export type XyoBridgeQuery<T extends XyoQuery = XyoQuery> = T extends XyoQuery ? XyoBridgeQueryBase | T : XyoBridgeQueryBase

export type XyoBridgeQuerySchema = XyoBridgeQuery['schema']
