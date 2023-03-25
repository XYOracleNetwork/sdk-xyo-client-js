import { ModuleQuery, Query } from '@xyo-network/module-model'

import { XyoBridgeConnectQuery } from './Connect'
import { XyoBridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type XyoBridgeQueryBase = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery
export type XyoBridgeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? XyoBridgeQueryBase | T : XyoBridgeQueryBase>
