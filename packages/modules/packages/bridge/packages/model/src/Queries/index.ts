import type { ModuleQueries } from '@xyo-network/module-model'

import type { BridgeConnectQuery } from './Connect.ts'
import type { BridgeDisconnectQuery } from './Disconnect.ts'
import type { BridgeExposeQuery } from './Expose.ts'
import type { BridgeUnexposeQuery } from './Unexpose.ts'

export * from './Connect.ts'
export * from './Disconnect.ts'
export * from './Expose.ts'
export * from './Unexpose.ts'

export type BridgeQueries = BridgeConnectQuery | BridgeDisconnectQuery | BridgeExposeQuery | BridgeUnexposeQuery
export type BridgeModuleQueries = ModuleQueries | BridgeQueries
