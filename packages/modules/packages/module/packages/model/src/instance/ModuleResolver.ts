import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from '../ModuleIdentifier.ts'
import { ModuleInstance } from './Instance.ts'
import { ObjectFilterOptions } from './ObjectFilter.ts'
import { isObjectResolver, ObjectResolver } from './ObjectResolver.ts'

export const isModuleResolver = isObjectResolver<ModuleInstance>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleResolver<TResult extends ModuleInstance = ModuleInstance> extends ObjectResolver<TResult> {}

export interface ModuleNameResolver {
  readonly root: ModuleInstance
  resolveIdentifier(id: ModuleIdentifier, options?: ObjectFilterOptions): Promisable<Address | undefined>
}

export interface ModuleResolverInstance<TResult extends ModuleInstance = ModuleInstance> extends ModuleResolver<TResult>, ModuleNameResolver {
  addResolver: (resolver: ModuleResolverInstance<TResult>) => this
  removeResolver: (resolver: ModuleResolverInstance<TResult>) => this
}
