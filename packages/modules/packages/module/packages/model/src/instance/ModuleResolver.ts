import { ModuleInstance } from './Instance'
import { isObjectResolver, ObjectResolver } from './ObjectResolver'

export const isModuleResolver = isObjectResolver<ModuleInstance>

export interface ModuleResolver<TResult extends ModuleInstance = ModuleInstance> extends ObjectResolver<TResult> {}

export interface ModuleResolverInstance<TResult extends ModuleInstance = ModuleInstance> extends ModuleResolver<TResult> {
  addResolver: (resolver: ModuleResolverInstance<TResult>) => this
  removeResolver: (resolver: ModuleResolverInstance<TResult>) => this
}
