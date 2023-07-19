import { exists } from '@xylabs/exists'
import { Base, BaseParams } from '@xyo-network/core'
import { duplicateModules, ModuleFilter, ModuleInstance, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

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

  add(module: ModuleInstance): this
  add(module: ModuleInstance[]): this
  add(module: ModuleInstance | ModuleInstance[]): this {
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

  async resolve(filter?: ModuleFilter): Promise<ModuleInstance[]>
  async resolve(nameOrAddress: string): Promise<ModuleInstance | undefined>
  async resolve(nameOrAddressOrFilter?: ModuleFilter | string): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      const results = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: ModuleInstance | undefined = await resolver.resolve(nameOrAddressOrFilter)
          return result
        }),
      )
      const result: ModuleInstance | undefined = results.filter(exists).filter(duplicateModules).pop()
      return result
    } else {
      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: ModuleInstance[] = await resolver.resolve(nameOrAddressOrFilter)
          return result
        }),
      )
      const flatResult: ModuleInstance[] = result.flat()
      return flatResult.filter(duplicateModules)
    }
  }

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      this.localResolver.add(module)
    }
  }
  private removeSingleModule(addressOrName: string) {
    this.localResolver.remove(addressOrName)
  }
}
