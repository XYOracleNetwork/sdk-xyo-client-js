import { ModuleQuery, ModuleQueryBase, Query } from '@xyo-network/module-model'

import { BridgeConnectQuery } from './Connect'
import { BridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type BridgeQueryBase = BridgeConnectQuery | BridgeDisconnectQuery
export type BridgeModuleQueries = ModuleQueryBase | BridgeQueryBase
export type BridgeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? BridgeQueryBase | T : BridgeQueryBase>
