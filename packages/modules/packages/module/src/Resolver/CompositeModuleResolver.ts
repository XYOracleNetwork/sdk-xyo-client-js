import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { Module, ModuleFilter, ModuleRepository } from '@xyo-network/module-model'

export class CompositeModuleResolver<TModule extends Module = Module> implements ModuleRepository {
  constructor(protected readonly resolvers: ModuleRepository<TModule>[]) {}

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

  remove(addressOrName: string | string[]): this {
    if (Array.isArray(addressOrName)) {
      addressOrName.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(addressOrName)
    }
    return this
  }

  async resolve(filter?: ModuleFilter): Promise<TModule[]> {
    const modules = this.resolvers.map((resolver) => resolver.resolve(filter))
    return (await Promise.all(modules)).flat()
  }

  async tryResolve(filter?: ModuleFilter): Promise<TModule[]> {
    const modules = this.resolvers.map((resolver) => resolver.tryResolve(filter))
    const settled = await Promise.allSettled(modules)
    return settled
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
  }

  private addSingleModule(module?: TModule, name?: string) {
    if (module) {
      this.resolvers.map((resolver) => resolver.add(module, name))
    }
  }
  private removeSingleModule(addressOrName: string) {
    this.resolvers.map((resolver) => resolver.remove(addressOrName))
  }
}
