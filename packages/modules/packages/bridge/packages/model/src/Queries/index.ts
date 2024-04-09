import { ModuleQueries } from '@xyo-network/module-model'

import { BridgeConnectQuery } from './Connect'
import { BridgeDisconnectQuery } from './Disconnect'
import { BridgeExposeQuery } from './Expose'
import { BridgeUnexposeQuery } from './Unexpose'

export * from './Connect'
export * from './Disconnect'
export * from './Expose'
export * from './Unexpose'

export type BridgeQueries = BridgeConnectQuery | BridgeDisconnectQuery | BridgeExposeQuery | BridgeUnexposeQuery
export type BridgeModuleQueries = ModuleQueries | BridgeQueries
