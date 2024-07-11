import { Promisable } from '@xylabs/promise'
import { ModuleIdentifier, ModuleQueryResult } from '@xyo-network/module-model'

import { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries/index.js'

export interface BridgeRawQueryFunctions {
  connectQuery?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<ModuleQueryResult>
  disconnectQuery?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<ModuleQueryResult>
  exposeQuery: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<ModuleQueryResult>
  unexposeQuery?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<ModuleQueryResult>
}
