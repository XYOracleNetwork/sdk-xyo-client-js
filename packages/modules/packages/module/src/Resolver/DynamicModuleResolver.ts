import { Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { duplicateModules } from '../lib'
import { CompositeModuleResolver } from './CompositeModuleResolver'

type ResolverFunction = (filter?: ModuleFilter) => Promisable<Module[]>

export class DynamicModuleResolver extends CompositeModuleResolver implements ModuleResolver {
  private _resolveImplementation: ResolverFunction

  constructor(resolveImplementation: ResolverFunction = () => [], resolvers: ModuleResolver[] = []) {
    super()
    resolvers.forEach((resolver) => super.addResolver(resolver))
    this._resolveImplementation = resolveImplementation
  }

  get resolveImplementation(): ResolverFunction {
    return this._resolveImplementation
  }
  set resolveImplementation(value: ResolverFunction) {
    this._resolveImplementation = value
  }

  override async resolve<T extends Module = Module>(filter?: ModuleFilter): Promise<T[]> {
    return [...(await this._resolveImplementation(filter)), ...(await super.resolve(filter))].filter(duplicateModules) as T[]
  }
}
