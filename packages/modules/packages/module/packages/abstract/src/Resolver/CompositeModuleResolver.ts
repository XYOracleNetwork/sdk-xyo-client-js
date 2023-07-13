import { exists } from '@xylabs/exists'
import { Base, BaseParams } from '@xyo-network/core'
import { duplicateModules, IndirectModule, ModuleFilter, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

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

  async resolve<TModule extends IndirectModule = IndirectModule>(filter?: ModuleFilter): Promise<TModule[]>
  async resolve<TModule extends IndirectModule = IndirectModule>(nameOrAddress: string): Promise<TModule | undefined>
  async resolve<TModule extends IndirectModule = IndirectModule>(
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<TModule | TModule[] | undefined> {
    if (typeof nameOrAddressOrFilter === 'string') {
      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          return await resolver.resolve<TModule>(nameOrAddressOrFilter)
        }),
      )
      return result.filter(exists).filter(duplicateModules).pop()
    } else {
      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          return await resolver.resolve<TModule>(nameOrAddressOrFilter)
        }),
      )
      const flatResult = result.flat()
      return flatResult.filter(duplicateModules)
    }
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
