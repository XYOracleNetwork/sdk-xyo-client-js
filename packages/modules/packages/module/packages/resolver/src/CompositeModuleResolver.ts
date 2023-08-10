import { exists } from '@xylabs/exists'
import { Base, BaseParams } from '@xyo-network/core'
import { duplicateModules, ModuleFilter, ModuleFilterOptions, ModuleInstance, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'

import { SimpleModuleResolver } from './SimpleModuleResolver'

export class CompositeModuleResolver extends Base implements ModuleRepository, ModuleResolver {
  static defaultMaxDepth = 5
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

  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const mutatedOptions = { ...options, maxDepth: (options?.maxDepth ?? CompositeModuleResolver.defaultMaxDepth) - 1 }
    if (typeof nameOrAddressOrFilter === 'string') {
      if (mutatedOptions.maxDepth < 0) {
        return undefined
      }
      const results = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T | undefined = await resolver.resolve<T>(nameOrAddressOrFilter, mutatedOptions)
          return result
        }),
      )
      const result: T | undefined = results.filter(exists).filter(duplicateModules).pop()
      return result
    } else {
      if (mutatedOptions.maxDepth < 0) {
        return []
      }
      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T[] = await resolver.resolve<T>(nameOrAddressOrFilter, mutatedOptions)
          return result
        }),
      )
      const flatResult: T[] = result.flat()
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
