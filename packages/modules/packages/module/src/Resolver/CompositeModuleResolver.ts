import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Module, ModuleFilter, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

import { duplicateModules } from '../lib'
import { SimpleModuleResolver } from './SimpleModuleResolver'

export class CompositeModuleResolver implements ModuleRepository {
  private localResolver = new SimpleModuleResolver()

  constructor(protected resolvers: ModuleResolver[] = []) {
    resolvers.push(this.localResolver)
  }

  get isModuleResolver() {
    return true
  }

  add(module: Module, name?: string): this
  add(module: Module[], name?: string[]): this
  add(module: Module | Module[], name?: string | string[]): this {
    if (Array.isArray(module)) {
      const nameArray = name ? assertEx(Array.isArray(name) ? name : undefined, 'name must be array or undefined') : undefined
      assertEx((nameArray?.length ?? module.length) === module.length, 'names/modules array mismatch')
      module.forEach((module, index) => this.addSingleModule(module, nameArray?.[index]))
    } else {
      this.addSingleModule(module, typeof name === 'string' ? name : undefined)
    }
    return this
  }

  addResolver(resolver: ModuleResolver) {
    this.resolvers.push(resolver)
  }

  remove(addressOrName: string | string[]): this {
    if (Array.isArray(addressOrName)) {
      addressOrName.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(addressOrName)
    }
    return this
  }

  removeResolver(resolver: ModuleResolver) {
    this.resolvers = this.resolvers.filter((item) => item !== resolver)
  }

  async resolve(filter?: ModuleFilter): Promise<Module[]> {
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
