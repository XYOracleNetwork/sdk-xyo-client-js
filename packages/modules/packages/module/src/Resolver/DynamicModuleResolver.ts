import { ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { AbstractModule } from '../AbstractModule'
import { CompositeModuleResolver } from './CompositeModuleResolver'

type ResolverFunction = (filter?: ModuleFilter) => Promisable<AbstractModule[]>

export class DynamicModuleResolver extends CompositeModuleResolver implements ModuleResolver<AbstractModule> {
  private _resolveImplementation: ResolverFunction

  constructor(resolveImplementation: ResolverFunction = () => [], resolvers: ModuleResolver<AbstractModule>[] = []) {
    super()
    resolvers.forEach((resolver) => super.addResolver(resolver))
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

  override async resolve(filter?: ModuleFilter): Promise<AbstractModule[]> {
    return await this._resolveImplementation(filter)
  }
}
