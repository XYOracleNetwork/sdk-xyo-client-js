import type { Address, Promisable } from '@xylabs/sdk-js'

import type { ModuleIdentifier } from '../ModuleIdentifier.ts'
import type { ModuleInstance } from './Instance.ts'
import type { ObjectFilterOptions } from './ObjectFilter.ts'
import type { ObjectResolver } from './ObjectResolver.ts'
import { isObjectResolver } from './ObjectResolver.ts'

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
