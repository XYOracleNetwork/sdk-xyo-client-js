import type { Address } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import type { ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import type { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries/index.ts'

export interface BridgeQueryFunctions {
  connect?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<Address | undefined>
  disconnect?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<Address | undefined>
  expose: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<ModuleInstance[]>
  unexpose?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<Address[]>
}
