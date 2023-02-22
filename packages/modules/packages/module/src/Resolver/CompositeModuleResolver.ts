import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Module, ModuleFilter, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

import { duplicateModules } from '../lib'
import { SimpleModuleResolver } from './SimpleModuleResolver'

export class CompositeModuleResolver<TModule extends Module = Module> implements ModuleRepository<TModule> {
  protected resolvers: ModuleResolver<TModule>[] = []
  private localResolver: SimpleModuleResolver

  constructor() {
    const localResolver = new SimpleModuleResolver<TModule>()
    this.addResolver(localResolver)
    this.localResolver = localResolver
  }

  get isModuleResolver() {
    return true
  }

  add(module: TModule, name?: string): this
  add(module: TModule[], name?: string[]): this
  add(module: TModule | TModule[], name?: string | string[]): this {
    if (Array.isArray(module)) {
      const nameArray = name ? assertEx(Array.isArray(name) ? name : undefined, 'name must be array or undefined') : undefined
      assertEx((nameArray?.length ?? module.length) === module.length, 'names/modules array mismatch')
      module.forEach((module, index) => this.addSingleModule(module, nameArray?.[index]))
    } else {
      this.addSingleModule(module, typeof name === 'string' ? name : undefined)
    }
    return this
  }

  addResolver(resolver: ModuleResolver<TModule>): this {
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

  removeResolver(resolver: ModuleResolver<TModule>): this {
    this.resolvers = this.resolvers.filter((item) => item !== resolver)
    return this
  }

  async resolve(filter?: ModuleFilter): Promise<TModule[]> {
    const modules = this.resolvers.map((resolver) => resolver.resolve(filter))
    const settled = await Promise.allSettled(modules)
    const result = settled
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(duplicateModules)
    return result
  }

  private addSingleModule(module?: Module, name?: string) {
    if (module) {
      this.localResolver.add(module, name)
    }
  }
  private removeSingleModule(addressOrName: string) {
    this.localResolver.remove(addressOrName)
  }
}
