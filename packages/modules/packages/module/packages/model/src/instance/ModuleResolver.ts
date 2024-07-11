import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from '../ModuleIdentifier.js'
import { ModuleInstance } from './Instance.js'
import { ObjectFilterOptions } from './ObjectFilter.js'
import { isObjectResolver, ObjectResolver } from './ObjectResolver.js'

export const isModuleResolver = isObjectResolver<ModuleInstance>

export interface ModuleResolver<TResult extends ModuleInstance = ModuleInstance> extends ObjectResolver<TResult> {}

export interface ModuleNameResolver {
  readonly root: ModuleInstance
  resolveIdentifier(id: ModuleIdentifier, options?: ObjectFilterOptions): Promisable<Address | undefined>
}

export interface ModuleResolverInstance<TResult extends ModuleInstance = ModuleInstance> extends ModuleResolver<TResult>, ModuleNameResolver {
  addResolver: (resolver: ModuleResolverInstance<TResult>) => this
  removeResolver: (resolver: ModuleResolverInstance<TResult>) => this
}
