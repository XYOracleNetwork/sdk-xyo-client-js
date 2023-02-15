import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { CompositeModuleResolver } from './CompositeModuleResolver'

type ResolverFunction = (filter?: ModuleFilter) => Promisable<Module[]>

export class DynamicModuleResolver extends CompositeModuleResolver implements ModuleResolver<Module> {
  private _resolveImplementation: ResolverFunction

  constructor(resolveImplementation: ResolverFunction = () => [], resolvers: ModuleResolver[] = []) {
    super(resolvers)
    this._resolveImplementation = resolveImplementation
  }

  public get isModuleResolver() {
    return true
  }

  public get resolveImplementation(): ResolverFunction {
    return this._resolveImplementation
  }
  public set resolveImplementation(value: ResolverFunction) {
    this._resolveImplementation = value
  }

  override async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return await this._resolveImplementation(filter)
  }

  override async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    try {
      return await this._resolveImplementation(filter)
    } catch (error) {
      return []
    }
  }
}
