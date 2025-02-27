import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { BridgeExposeOptions, BridgeUnexposeOptions } from './Queries/index.ts'

export interface BridgeQueryFunctions {
  connect?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<Address | undefined>
  disconnect?: (id: ModuleIdentifier, maxDepth?: number) => Promisable<Address | undefined>
  expose: (id: ModuleIdentifier, options?: BridgeExposeOptions) => Promisable<ModuleInstance[]>
  unexpose?: (id: ModuleIdentifier, options?: BridgeUnexposeOptions) => Promisable<Address[]>
}
