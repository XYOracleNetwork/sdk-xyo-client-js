import { ModuleQueries } from '@xyo-network/module-model'

import { BridgeConnectQuery } from './Connect.ts'
import { BridgeDisconnectQuery } from './Disconnect.ts'
import { BridgeExposeQuery } from './Expose.ts'
import { BridgeUnexposeQuery } from './Unexpose.ts'

export * from './Connect.ts'
export * from './Disconnect.ts'
export * from './Expose.ts'
export * from './Unexpose.ts'

export type BridgeQueries = BridgeConnectQuery | BridgeDisconnectQuery | BridgeExposeQuery | BridgeUnexposeQuery
export type BridgeModuleQueries = ModuleQueries | BridgeQueries
