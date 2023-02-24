import { AnyModuleFilter, Module, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { duplicateModules } from '../lib'
import { CompositeModuleResolver } from './CompositeModuleResolver'

type ResolverFunction<TModule extends Module = Module> = (filter?: AnyModuleFilter) => Promisable<TModule[]>

export class DynamicModuleResolver<TModule extends Module = Module> extends CompositeModuleResolver<TModule> implements ModuleResolver<TModule> {
  private _resolveImplementation: ResolverFunction<TModule>

  constructor(resolveImplementation: ResolverFunction<TModule> = () => [], resolvers: ModuleResolver<TModule>[] = []) {
    super()
    resolvers.forEach((resolver) => super.addResolver(resolver))
    this._resolveImplementation = resolveImplementation
  }

  get resolveImplementation(): ResolverFunction<TModule> {
    return this._resolveImplementation
  }
  set resolveImplementation(value: ResolverFunction<TModule>) {
    this._resolveImplementation = value
  }

  override async resolve(filter?: AnyModuleFilter): Promise<TModule[]> {
    return [...(await this._resolveImplementation(filter)), ...(await super.resolve(filter))].filter(duplicateModules)
  }
}
