import { fulfilled } from '@xylabs/promise'
import { Base, BaseParams } from '@xyo-network/core'
import { IndirectModule, ModuleFilter, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

import { duplicateModules } from '../lib'
import { SimpleModuleResolver } from './SimpleModuleResolver'

export class CompositeModuleResolver extends Base implements ModuleRepository, ModuleResolver {
  protected resolvers: ModuleResolver[] = []
  private localResolver: SimpleModuleResolver

  constructor(params: BaseParams = {}) {
    super(params)
    const localResolver = new SimpleModuleResolver()
    this.addResolver(localResolver)
    this.localResolver = localResolver
  }

  get isModuleResolver() {
    return true
  }

  add(module: IndirectModule): this
  add(module: IndirectModule[]): this
  add(module: IndirectModule | IndirectModule[]): this {
    if (Array.isArray(module)) {
      module.forEach((module) => this.addSingleModule(module))
    } else {
      this.addSingleModule(module)
    }
    return this
  }

  addResolver(resolver: ModuleResolver): this {
    this.resolvers.push(resolver)
    return this
  }

  remove(addressOrName: string | string[]): this {
    if (Array.isArray(addressOrName)) {
      addressOrName.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(addressOrName)
    }
    return this
  }

  removeResolver(resolver: ModuleResolver): this {
    this.resolvers = this.resolvers.filter((item) => item !== resolver)
    return this
  }

  async resolve<T extends IndirectModule = IndirectModule>(filter?: ModuleFilter): Promise<T[]> {
    const modules = await Promise.allSettled(this.resolvers.map((resolver) => resolver.resolve(filter)))
    const result = modules
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(duplicateModules)
    return result as T[]
  }

  async resolveOne<T extends IndirectModule = IndirectModule>(addressOrName: string): Promise<T | undefined> {
    for (let i = 0; i < this.resolvers.length; i++) {
      const resolver = this.resolvers[i]
      const result = await resolver.resolveOne<T>(addressOrName)
      if (result) return result
    }
    return undefined
  }

  private addSingleModule(module?: IndirectModule) {
    if (module) {
      this.localResolver.add(module)
    }
  }
  private removeSingleModule(addressOrName: string) {
    this.localResolver.remove(addressOrName)
  }
}
