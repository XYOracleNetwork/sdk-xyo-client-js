/* eslint-disable max-statements */
/* eslint-disable complexity */

import { exists } from '@xylabs/exists'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'
import { BridgeInstance } from '@xyo-network/bridge-model'
import {
  CacheConfig,
  isAddressModuleFilter,
  isNameModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleResolver,
} from '@xyo-network/module-model'
import { LRUCache } from 'lru-cache'

import { wrapModuleWithType } from './wrapModuleWithType'

export interface BridgeModuleResolverOptions {
  bridge: BridgeInstance
  cacheConfig?: CacheConfig
  downResolver?: ModuleResolver
  upResolver?: ModuleResolver
  wrapperAccount: AccountInstance
}

export abstract class AbstractBridgeModuleResolver<T extends BridgeModuleResolverOptions = BridgeModuleResolverOptions> implements ModuleResolver {
  private _cache?: LRUCache<ModuleIdentifier, ModuleInstance>

  constructor(protected options: T) {}

  get cache() {
    this._cache =
      this._cache ??
      (() => {
        const { max = 100, ttl = 1000 * 60 * 5 /* five minutes */, ...cache } = this.options.cacheConfig ?? {}
        return new LRUCache<ModuleIdentifier, ModuleInstance>({ max, ttl, ...cache })
      })()
    return this._cache
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve(): Promise<ModuleInstance[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const direction = options?.direction ?? 'all'
    if (idOrFilter === '*') {
      if (direction === 'all') {
        const downResolve = (await this.options.downResolver?.resolve<T>('*', options)) ?? []
        const upResolve = (await this.options.upResolver?.resolve<T>('*', options)) ?? []
        return [...downResolve, ...upResolve]
      }
      if (direction === 'down') {
        return (await this.options.downResolver?.resolve<T>('*', options)) ?? []
      }
      if (direction === 'up') {
        return (await this.options.upResolver?.resolve<T>('*', options)) ?? []
      }
      return []
    } else if (typeof idOrFilter === 'string') {
      if (direction === 'all' || direction === 'down') {
        const downResolve = await this.options.downResolver?.resolve<T>(idOrFilter)
        if (downResolve) return downResolve
      }
      if (direction === 'all' || direction === 'up') {
        const upResolve = await this.options.upResolver?.resolve<T>(idOrFilter)
        if (upResolve) return upResolve
      }
      const cachedResult = this.cache.get(idOrFilter)
      if (cachedResult) {
        if (cachedResult.status === 'dead') {
          this.cache.delete(idOrFilter)
        } else {
          return cachedResult as T
        }
      }
      const module = await this.resolveHandler<T>(idOrFilter)
      this.cache.set(idOrFilter, module)
      await module?.start?.()
      const result = module ? (wrapModuleWithType(module, this.options.wrapperAccount) as unknown as T) : undefined
      if (result) {
        this.cache.set(idOrFilter, result)
      }
      return result
    } else {
      const filter = idOrFilter
      if (isAddressModuleFilter(filter)) {
        return (await Promise.all(filter.address.map((item) => this.resolve(item, options)))).filter(exists)
      } else if (isNameModuleFilter(filter)) {
        return (await Promise.all(filter.name.map((item) => this.resolve(item, options)))).filter(exists)
      }
    }
  }

  abstract resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T | undefined>
}
