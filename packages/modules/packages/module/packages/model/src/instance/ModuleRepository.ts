import type { Address } from '@xylabs/sdk-js'

import type { ModuleInstance } from './Instance.ts'
import type { ModuleResolverInstance } from './ModuleResolver.ts'

export interface ModuleRepository<T extends ModuleInstance = ModuleInstance> extends ModuleResolverInstance<T> {
  add(mod: T): this
  add(mod: T[]): this
  add(mod: T | T[]): this

  remove(address: Address | string[]): this
}
