import { AbstractModuleQuery, XyoQuery } from '@xyo-network/module'

import { XyoBridgeConnectQuery } from './Connect'
import { XyoBridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type XyoBridgeQueryBase = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery
export type XyoBridgeQuery<T extends XyoQuery | void = void> = AbstractModuleQuery<T extends XyoQuery ? XyoBridgeQueryBase | T : XyoBridgeQueryBase>
