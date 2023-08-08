import { ModuleQuery, ModuleQueryBase } from '@xyo-network/module-model'
import { Query } from '@xyo-network/payload-model'

import { BridgeConnectQuery } from './Connect'
import { BridgeConnectedQuery } from './Connected'
import { BridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Connected'
export * from './Disconnect'

export type BridgeQueryBase = BridgeConnectQuery | BridgeDisconnectQuery | BridgeConnectedQuery
export type BridgeModuleQueries = ModuleQueryBase | BridgeQueryBase
export type BridgeQuery<T extends Query | void = void> = ModuleQuery<T extends Query ? BridgeQueryBase | T : BridgeQueryBase>
