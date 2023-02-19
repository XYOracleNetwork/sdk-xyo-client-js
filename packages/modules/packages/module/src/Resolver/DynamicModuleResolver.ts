import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { duplicateModules } from '../lib'
import { CompositeModuleResolver } from './CompositeModuleResolver'

type ResolverFunction<TModule extends Module = Module> = (filter?: ModuleFilter) => Promisable<TModule[]>

export class DynamicModuleResolver<TModule extends Module = Module> extends CompositeModuleResolver<TModule> implements ModuleResolver<TModule> {
  private _resolveImplementation: ResolverFunction<TModule>

  constructor(resolveImplementation: ResolverFunction<TModule> = () => [], resolvers: ModuleResolver<TModule>[] = []) {
    super()
    resolvers.forEach((resolver) => super.addResolver(resolver))
    this._resolveImplementation = resolveImplementation
  }

  public get isModuleResolver() {
    return true
  }

  public get resolveImplementation(): ResolverFunction<TModule> {
    return this._resolveImplementation
  }
  public set resolveImplementation(value: ResolverFunction<TModule>) {
    this._resolveImplementation = value
  }

  override async resolve(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this._resolveImplementation(filter)), ...(await super.resolve(filter))].filter(duplicateModules)
  }
}
