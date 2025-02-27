import type { Promisable } from '@xylabs/promise'
import type { ModuleIdentifier, ModuleQueryResult } from '@xyo-network/module-model'

import type { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries/index.ts'

export interface BridgeRawQueryFunctions {
  connectQuery?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<ModuleQueryResult>
  disconnectQuery?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<ModuleQueryResult>
  exposeQuery: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<ModuleQueryResult>
  unexposeQuery?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<ModuleQueryResult>
}
