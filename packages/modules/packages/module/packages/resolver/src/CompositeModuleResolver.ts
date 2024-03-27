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
  ModuleInstance,
  ModuleRepository,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { AbstractModuleResolver } from './AbstractModuleResolver'
import { SimpleModuleResolver } from './SimpleModuleResolver'
import { ModuleIdentifierTransformer } from './transformers'

export type ModuleIdentifierTransformerFunc = (id: ModuleIdentifier) => Promisable<ModuleIdentifier>

export interface ModuleResolverParams extends BaseParams {
  cache?: CacheConfig
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
}

const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
  return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
}

export class CompositeModuleResolver extends AbstractModuleResolver<ModuleResolverParams> implements ModuleRepository, ModuleResolverInstance {
  static defaultMaxDepth = 5
  protected _cache: LRUCache<ModuleIdentifier, ModuleInstance>
  protected resolvers: ModuleResolverInstance[] = []
  private _localResolver: SimpleModuleResolver

  constructor({ cache, ...params }: ModuleResolverParams = {}) {
    super(params)
    const localResolver = new SimpleModuleResolver()
    this.addResolver(localResolver)
    const { max = 100, ttl = 1000 * 5 /* five seconds */ } = cache ?? {}
    this._cache = new LRUCache<ModuleIdentifier, ModuleInstance>({ max, ttl, ...cache })
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
    const childOptions = { ...mutatedOptions, maxDepth: mutatedOptions?.maxDepth - 1 }

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

      const results = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T | undefined = await resolver.resolve<T>(id, childOptions)
          return result
        }),
      )
      const result: T | undefined = results.filter(exists).filter(duplicateModules).pop()
      if (result) {
        this._cache.set(id, result)
      }
      return result
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
    for (const transformer of this.moduleIdentifierTransformers ?? []) {
      id = await transformer.transform(id)
    }
    return id
  }
}
