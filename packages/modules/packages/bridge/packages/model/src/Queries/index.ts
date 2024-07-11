import { ModuleQueries } from '@xyo-network/module-model'

import { BridgeConnectQuery } from './Connect.js'
import { BridgeDisconnectQuery } from './Disconnect.js'
import { BridgeExposeQuery } from './Expose.js'
import { BridgeUnexposeQuery } from './Unexpose.js'

export * from './Connect.js'
export * from './Disconnect.js'
export * from './Expose.js'
export * from './Unexpose.js'

export type BridgeQueries = BridgeConnectQuery | BridgeDisconnectQuery | BridgeExposeQuery | BridgeUnexposeQuery
export type BridgeModuleQueries = ModuleQueries | BridgeQueries
