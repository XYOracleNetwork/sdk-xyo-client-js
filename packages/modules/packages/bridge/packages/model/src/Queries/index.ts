import { ModuleQuery, ModuleQueryBase } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

import { BridgeConnectQuery } from './Connect'
import { BridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

export type BridgeQueryBase = BridgeConnectQuery | BridgeDisconnectQuery
export type BridgeModuleQueries = ModuleQueryBase | BridgeQueryBase
export type BridgeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? BridgeQueryBase | T : BridgeQueryBase>
