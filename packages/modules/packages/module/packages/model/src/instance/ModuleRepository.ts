import { Address } from '@xylabs/hex'

import { ModuleInstance } from './Instance'
import { ModuleResolverInstance } from './ModuleResolver'

export interface ModuleRepository<T extends ModuleInstance = ModuleInstance> extends ModuleResolverInstance<T> {
  add(module: T): this
  add(module: T[]): this
  add(module: T | T[]): this

  remove(address: Address | string[]): this
}
