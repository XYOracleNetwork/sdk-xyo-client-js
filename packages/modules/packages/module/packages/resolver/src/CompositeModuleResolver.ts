/* eslint-disable max-statements */
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import { isDefined, isString } from '@xylabs/typeof'
import type {
  CacheConfig,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleIdentifierPart,
  ModuleIdentifierTransformer,
  ModuleInstance,
  ModuleRepository,
  ModuleResolverInstance,
  ObjectFilterOptions,
} from '@xyo-network/module-model'
import {
  duplicateModules,
  ObjectResolverPriority,
  ResolveHelper,
} from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import type { ModuleResolverParams } from './AbstractModuleResolver.ts'
import { AbstractModuleResolver } from './AbstractModuleResolver.ts'
import { SimpleModuleResolver } from './SimpleModuleResolver.ts'

export interface CompositeModuleResolverParams extends ModuleResolverParams {
  allowNameResolution?: boolean
  cache?: CacheConfig
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
}

const moduleIdentifierParts = (moduleIdentifier: ModuleIdentifier): ModuleIdentifierPart[] => {
  return moduleIdentifier?.split(':') as ModuleIdentifierPart[]
}

export class CompositeModuleResolver<T extends CompositeModuleResolverParams = CompositeModuleResolverParams>
  extends AbstractModuleResolver<T>
  implements ModuleRepository, ModuleResolverInstance {
  static readonly defaultMaxDepth = 3

  protected _cache: LRUCache<ModuleIdentifier, ModuleInstance>
  protected resolvers: ModuleResolverInstance[] = []
  private _allowAddResolver = true
  private _localResolver: SimpleModuleResolver

  constructor(params: T) {
    super(params)
    const localResolver = new SimpleModuleResolver({ allowNameResolution: params.allowNameResolution, root: params.root })
    this.addResolver(localResolver)
    const { max = 100, ttl = 1000 * 5 /* five seconds */ } = params.cache ?? {}
    this._cache = new LRUCache<ModuleIdentifier, ModuleInstance>({
      max, ttl, ...params.cache,
    })
    this._localResolver = localResolver
  }

  get allowAddResolver() {
    return this._allowAddResolver
  }

  set allowAddResolver(value: boolean) {
    this.resolvers = [this._localResolver]
    this._allowAddResolver = value
  }

  get allowNameResolution() {
    return this.params.allowNameResolution ?? true
  }

  private get moduleIdentifierTransformers() {
    return this.params.moduleIdentifierTransformers ?? ResolveHelper.transformers
  }

  add(mod: ModuleInstance): this
  add(mod: ModuleInstance[]): this
  add(mod: ModuleInstance | ModuleInstance[]): this {
    if (Array.isArray(mod)) {
      for (const modItem of mod) this.addSingleModule(modItem)
    } else {
      this.addSingleModule(mod)
    }
    return this
  }

  addResolver(resolver: ModuleResolverInstance): this {
    if (this.allowAddResolver) {
      this.resolvers.push(resolver)
    }
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
    this.resolvers = this.resolvers.filter(item => item !== resolver)
    return this
  }

  // eslint-disable-next-line complexity
  async resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options: ModuleFilterOptions<T> = {},
  ): Promise<T[]> {
    const mutatedOptions = { ...options, maxDepth: options?.maxDepth ?? CompositeModuleResolver.defaultMaxDepth }

    // resolve all
    if (id === '*') {
      // wen't too far?
      if (mutatedOptions.maxDepth < 0) {
        return []
      }

      // identity resolve?
      if (mutatedOptions.maxDepth === 0) {
        return (await this._localResolver.resolve('*', mutatedOptions)) ?? []
      }

      const childOptions = { ...mutatedOptions, maxDepth: mutatedOptions?.maxDepth - 1 }

      const result = await Promise.all(
        this.resolvers.map(async (resolver) => {
          const result: T[] = await resolver.resolve<T>('*', childOptions)
          return result
        }),
      )
      const flatResult: T[] = result.flat().filter(exists)
      return flatResult.filter((v, i, a) => duplicateModules(v, i, a))
    }

    if (typeof id === 'string') {
      // wen't too far?
      if (mutatedOptions.maxDepth < 0) {
        return []
      }

      // resolve ModuleIdentifier
      const idParts = moduleIdentifierParts(id)
      if (idParts.length > 1) {
        const mod = await this.resolveMultipartIdentifier<T>(id)
        return (
          mod
            ? Array.isArray(mod)
              ? mod
              : [mod]
            : []
        )
      }
      const resolvedId = await ResolveHelper.transformModuleIdentifier(id, this.moduleIdentifierTransformers)
      if (isString(resolvedId)) {
        if (mutatedOptions.maxDepth < 0) {
          return []
        }
        const cachedResult = this._cache.get(resolvedId)
        if (cachedResult) {
          if (cachedResult.status === 'error') {
            this._cache.delete(id)
          } else {
            return [cachedResult] as T[]
          }
        }

        // identity resolve?
        if (mutatedOptions.maxDepth === 0) {
          const mod = await this._localResolver.resolve(resolvedId, mutatedOptions)
          return (
            isDefined(mod)
              ? Array.isArray(mod)
                ? mod
                : [mod]
              : []
          )
        }

        // recursive function to resolve by priority
        const resolvePriority = async (priority: ObjectResolverPriority): Promise<T | undefined> => {
          const resolvers = this.resolvers.filter(resolver => resolver.priority === priority)
          const results: T[] = (
            await Promise.all(
              resolvers.map(async (resolver) => {
                const result: T | undefined = await resolver.resolve<T>(resolvedId, mutatedOptions)
                return result
              }),
            )
          ).filter(exists)

          const result: T | undefined = results.filter(exists).findLast((v, i, a) => duplicateModules(v, i, a))
          if (result) {
            this._cache.set(resolvedId, result)
            return result
          }
          // we know that ObjectResolverPriority.VeryLow is the minimum priority, so we can subtract 1 from the rest
          return priority === ObjectResolverPriority.VeryLow ? undefined : await resolvePriority((priority - 1) as ObjectResolverPriority)
        }
        const mod = await resolvePriority(ObjectResolverPriority.VeryHigh)
        return (
          mod
            ? Array.isArray(mod)
              ? mod
              : [mod]
            : []
        )
      }
    }
    return []
  }

  async resolveIdentifier(id: ModuleIdentifier, _options?: ObjectFilterOptions): Promise<Address | undefined> {
    const idParts = id.split(':')
    if (idParts.length > 1) {
      return this.resolveComplexIdentifier(id)
    }
    const results = (
      await Promise.all(
        this.resolvers.map(async (resolver) => {
          return await resolver.resolveIdentifier(id)
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

  private addSingleModule(mod?: ModuleInstance) {
    if (mod) {
      this._localResolver.add(mod)
    }
  }

  private removeSingleModule(address: Address) {
    this._localResolver.remove(address)
  }

  private async resolveMultipartIdentifier<T extends ModuleInstance = ModuleInstance>(moduleIdentifier: ModuleIdentifier): Promise<T | undefined> {
    const idParts = moduleIdentifierParts(moduleIdentifier)
    assertEx(idParts.length >= 2, () => 'Not a valid multipart identifier')
    const id = assertEx(idParts.shift())
    const mod = (await this.resolve<T>(id)) ?? (await this.resolvePrivate<T>(id))
    return (await mod?.resolve<T>(idParts.join(':'))) ?? (await mod?.resolvePrivate<T>(idParts.join(':')))
  }
}
