import { Address } from '@xylabs/hex'

import { ModuleInstance } from './Instance.js'
import { ModuleResolverInstance } from './ModuleResolver.js'

export interface ModuleRepository<T extends ModuleInstance = ModuleInstance> extends ModuleResolverInstance<T> {
  add(mod: T): this
  add(mod: T[]): this
  add(mod: T | T[]): this

  remove(address: Address | string[]): this
}
