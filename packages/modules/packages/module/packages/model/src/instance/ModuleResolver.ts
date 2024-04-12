import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from '../ModuleIdentifier'
import { ModuleInstance } from './Instance'
import { ObjectFilterOptions } from './ObjectFilter'
import { isObjectResolver, ObjectResolver } from './ObjectResolver'

export const isModuleResolver = isObjectResolver<ModuleInstance>

export interface ModuleResolver<TResult extends ModuleInstance = ModuleInstance> extends ObjectResolver<TResult> {}

export interface ModuleNameResolver {
  readonly root: ModuleInstance
  resolveIdentifier(id: ModuleIdentifier, options?: ObjectFilterOptions): Promisable<Address | undefined>
}

export interface ModuleResolverInstance<TResult extends ModuleInstance = ModuleInstance> extends ModuleResolver<TResult>, ModuleNameResolver {
  add: (module: TResult) => this
  addResolver: (resolver: ModuleResolverInstance<TResult>) => this
  remove: (address: Address) => this
  removeResolver: (resolver: ModuleResolverInstance<TResult>) => this
}
