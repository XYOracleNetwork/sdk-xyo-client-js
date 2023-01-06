import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

type ResolverFunction<TModule extends Module = Module> = (filter?: ModuleFilter) => Promisable<TModule[]>

export class DynamicModuleResolver<TModule extends Module = Module> implements ModuleResolver<TModule> {
  private _resolveImplementation: ResolverFunction<TModule>

  constructor(resolveImplementation: ResolverFunction<TModule> = () => []) {
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

  resolve(filter?: ModuleFilter): Promisable<TModule[]> {
    return this._resolveImplementation(filter)
  }

  tryResolve(filter?: ModuleFilter): Promisable<TModule[]> {
    try {
      return this._resolveImplementation(filter)
    } catch (error) {
      return []
    }
  }
}
