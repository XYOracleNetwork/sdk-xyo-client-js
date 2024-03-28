import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from '../ModuleIdentifier'
import { ModuleInstance } from './Instance'
import { isObjectResolver, ObjectResolver } from './ObjectResolver'

export const isModuleResolver = isObjectResolver<ModuleInstance>

export interface ModuleResolver<TResult extends ModuleInstance = ModuleInstance> extends ObjectResolver<TResult> {}

export interface ModuleNameResolver {
  resolveIdentifier(id: ModuleIdentifier): Promisable<Address | undefined>
}

export interface ModuleResolverInstance<TResult extends ModuleInstance = ModuleInstance> extends ModuleResolver<TResult>, ModuleNameResolver {
  addResolver: (resolver: ModuleResolverInstance<TResult>) => this
  removeResolver: (resolver: ModuleResolverInstance<TResult>) => this
}
