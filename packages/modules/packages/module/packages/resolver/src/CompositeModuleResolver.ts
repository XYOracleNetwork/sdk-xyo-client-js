/* eslint-disable max-statements */
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { BaseParams } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import {
  CacheConfig,
  duplicateModules,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleIdentifierPart,
  ModuleIdentifierTransformer,
  ModuleInstance,
  ModuleRepository,
  ModuleResolverInstance,
  ObjectFilterOptions,
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { AbstractModuleResolver } from './AbstractModuleResolver'
import { SimpleModuleResolver } from './SimpleModuleResolver'

export interface ModuleResolverParams extends BaseParams {
  cache?: CacheConfig
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
}

const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
  return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
}

export class CompositeModuleResolver<T extends ModuleResolverParams = ModuleResolverParams>
  extends AbstractModuleResolver<T>
  implements ModuleRepository, ModuleResolverInstance
{
  static defaultMaxDepth = 10
  static transformers: ModuleIdentifierTransformer[] = []
  protected _cache: LRUCache<ModuleIdentifier, ModuleInstance>
  protected resolvers: ModuleResolverInstance[] = []
  private _localResolver: SimpleModuleResolver

  constructor(params: T) {
    super(params)
    const localResolver = new SimpleModuleResolver()
    this.addResolver(localResolver)
    const { max = 100, ttl = 1000 * 5 /* five seconds */ } = params.cache ?? {}
    this._cache = new LRUCache<ModuleIdentifier, ModuleInstance>({ max, ttl, ...params.cache })
    this._localResolver = localResolver
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

  async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T | T[] | undefined> {
    const mutatedOptions = { ...options, maxDepth: options?.maxDepth ?? CompositeModuleResolver.defaultMaxDepth }

    //resolve all
    if (idOrFilter === '*') {
      const all = idOrFilter

      //wen't too far?
      if (mutatedOptions.maxDepth < 0) {
        return []
      }

      //identity resolve?
      if (mutatedOptions.maxDepth === 0) {
        return await this._localResolver.resolve(all, mutatedOptions)
      }

      const childOptions = { ...mutatedOptions, maxDepth: mutatedOptions?.maxDepth - 1 }

      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T[] = await resolver.resolve<T>(all, childOptions)
          return result
        }),
      )
      const flatResult: T[] = result.flat().filter(exists)
      return flatResult.filter(duplicateModules)
    }

    if (typeof idOrFilter === 'string') {
      //wen't too far?
      if (mutatedOptions.maxDepth < 0) {
        return
      }

      //resolve ModuleIdentifier
      const idParts = moduleIdentifierParts(idOrFilter)
      if (idParts.length > 1) {
        return await this.resolveMultipartIdentifier<T>(idOrFilter)
      }
      const id = await this.transformModuleIdentifier(idOrFilter)
      if (mutatedOptions.maxDepth < 0) {
        return undefined
      }
      const cachedResult = this._cache.get(id)
      if (cachedResult) {
        if (cachedResult.status === 'dead') {
          this._cache.delete(id)
        } else {
          return cachedResult as T
        }
      }

      //identity resolve?
      if (mutatedOptions.maxDepth === 0) {
        return await this._localResolver.resolve(idOrFilter, mutatedOptions)
      }

      //recursive function to resolve by priority
      const resolvePriority = async (priority: ObjectResolverPriority): Promise<T | undefined> => {
        const resolvers = this.resolvers.filter((resolver) => resolver.priority === priority)
        const results: (T | undefined)[] = (
          await Promise.all(
            resolvers.map(async (resolver) => {
              const result: T | undefined = await resolver.resolve<T>(id, mutatedOptions)
              return result
            }),
          )
        ).filter(exists)

        const result: T | undefined = results.filter(exists).filter(duplicateModules).pop()
        if (result) {
          this._cache.set(id, result)
          return result
        }
        return priority === ObjectResolverPriority.VeryLow ? undefined : await resolvePriority(priority - 1)
      }

      return resolvePriority(ObjectResolverPriority.VeryHigh)
    } else {
      //wen't too far?
      if (mutatedOptions.maxDepth < 0) {
        return []
      }

      const filter = idOrFilter

      //identity resolve?
      if (mutatedOptions.maxDepth === 0) {
        return await this._localResolver.resolve(filter, mutatedOptions)
      }

      const childOptions = { ...mutatedOptions, maxDepth: mutatedOptions?.maxDepth - 1 }

      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T[] = await resolver.resolve<T>(filter, childOptions)
          return result
        }),
      )
      const flatResult: T[] = result.flat().filter(exists)
      return flatResult.filter(duplicateModules)
    }
  }

  async resolveIdentifier(id: ModuleIdentifier, _options?: ObjectFilterOptions): Promise<Address | undefined> {
    const idParts = id.split(':')
    if (idParts.length > 1) {
      return this.resolveComplexIdentifier(id)
    }
    const results = (
      await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result = await resolver.resolveIdentifier(id)
          return result
        }),
      )
    ).filter(exists)
    const result = results.shift()
    if (results.length > 0) {
      for (const altResult of results) {
        assertEx(altResult === result, () => `Inconsistent results for ${id} [${result}][${altResult}]`)
      }
    }
    return result
  }

  protected resolveComplexIdentifier(_id: ModuleIdentifier, _options?: ObjectFilterOptions): Promisable<Address | undefined> {
    throw new Error('Method not implemented.')
  }

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      this._localResolver.add(module)
    }
  }
  private removeSingleModule(address: Address) {
    this._localResolver.remove(address)
  }

  private async resolveMultipartIdentifier<T extends ModuleInstance = ModuleInstance>(moduleIdentifier: ModuleIdentifier): Promise<T | undefined> {
    const idParts = moduleIdentifierParts(moduleIdentifier)
    assertEx(idParts.length >= 2, () => 'Not a valid multipart identifier')
    const id = assertEx(idParts.shift())
    const module = await this.resolve<T>(id)
    return await module?.resolve<T>(idParts.join(':'))
  }

  private async transformModuleIdentifier(identifier: ModuleIdentifier) {
    let id = identifier
    for (const transformer of this.moduleIdentifierTransformers ?? CompositeModuleResolver.transformers) {
      id = await transformer.transform(id)
    }
    return id
  }
}
