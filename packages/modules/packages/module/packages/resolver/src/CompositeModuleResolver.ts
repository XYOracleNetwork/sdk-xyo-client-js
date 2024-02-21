import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { Base, BaseParams } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import {
  duplicateModules,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleIdentifierPart,
  ModuleInstance,
  ModuleRepository,
  ModuleResolverInstance,
} from '@xyo-network/module-model'

import { SimpleModuleResolver } from './SimpleModuleResolver'
import { ModuleIdentifierTransformer } from './transformers'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier>

export interface ModuleResolverParams extends BaseParams {
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
}

const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
  return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
}

export class CompositeModuleResolver extends Base<ModuleResolverParams> implements ModuleRepository, ModuleResolverInstance {
  static defaultMaxDepth = 5
  protected resolvers: ModuleResolverInstance[] = []
  private localResolver: SimpleModuleResolver

  constructor(params: ModuleResolverParams = {}) {
    super(params)
    const localResolver = new SimpleModuleResolver()
    this.addResolver(localResolver)
    this.localResolver = localResolver
  }

  private get moduleIdentifierTransformers() {
    return this.params.moduleIdentifierTransformers
  }

  add(module: ModuleInstance): this
  add(module: ModuleInstance[]): this
  add(module: ModuleInstance | ModuleInstance[]): this {
    if (Array.isArray(module)) {
      for (const mod of module) this.addSingleModule(mod)
    } else {
      this.addSingleModule(module)
    }
    return this
  }

  addResolver(resolver: ModuleResolverInstance): this {
    this.resolvers.push(resolver)
    return this
  }

  remove(addresses: Address[] | Address): this {
    if (Array.isArray(addresses)) {
      for (const address of addresses) this.removeSingleModule(address)
    } else {
      this.removeSingleModule(addresses)
    }
    return this
  }

  removeResolver(resolver: ModuleResolverInstance): this {
    this.resolvers = this.resolvers.filter((item) => item !== resolver)
    return this
  }

  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleFilter<T> | ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const mutatedOptions = { ...options, maxDepth: (options?.maxDepth ?? CompositeModuleResolver.defaultMaxDepth) - 1 }
    if (typeof idOrFilter === 'string') {
      const idParts = moduleIdentifierParts(idOrFilter)
      if (idParts.length > 1) {
        return await this.resolveMultipartIdentifier<T>(idOrFilter)
      }
      const id = await this.transformModuleIdentifier(idOrFilter)
      if (mutatedOptions.maxDepth < 0) {
        return undefined
      }
      const results = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T | undefined = await resolver.resolve<T>(id, mutatedOptions)
          return result
        }),
      )
      const result: T | undefined = results.filter(exists).filter(duplicateModules).pop()
      return result
    } else {
      const filter = idOrFilter
      if (mutatedOptions.maxDepth < 0) {
        return []
      }
      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T[] = await resolver.resolve<T>(filter, mutatedOptions)
          return result
        }),
      )
      const flatResult: T[] = result.flat().filter(exists)
      return flatResult.filter(duplicateModules)
    }
  }

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      this.localResolver.add(module)
    }
  }
  private removeSingleModule(address: Address) {
    this.localResolver.remove(address)
  }

  private async resolveMultipartIdentifier<T extends ModuleInstance = ModuleInstance>(moduleIdentifier: ModuleIdentifier): Promise<T | undefined> {
    const idParts = moduleIdentifierParts(moduleIdentifier)
    assertEx(idParts.length >= 2, 'Not a valid multipart identifier')
    const id = assertEx(idParts.shift())
    const module = await this.resolve(id)
    return await module?.resolve<T>(idParts.join(':'))
  }

  private async transformModuleIdentifier(identifier: ModuleIdentifier) {
    let id = identifier
    for (const transformer of this.moduleIdentifierTransformers ?? []) {
      id = await transformer.transform(id)
    }
    return id
  }
}
