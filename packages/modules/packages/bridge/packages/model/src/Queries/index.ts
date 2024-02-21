import { ModuleQueries } from '@xyo-network/module-model'

import { BridgeConnectQuery } from './Connect'
import { BridgeConnectedQuery } from './Connected'
import { BridgeDisconnectQuery } from './Disconnect'

export * from './Connect'
export * from './Connected'
export * from './Disconnect'

export type BridgeQueries = BridgeConnectQuery | BridgeDisconnectQuery | BridgeConnectedQuery
export type BridgeModuleQueries = ModuleQueries | BridgeQueries
