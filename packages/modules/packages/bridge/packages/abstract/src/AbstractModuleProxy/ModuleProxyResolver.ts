import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import {
  isAddressModuleFilter,
  isNameModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleName,
  ModuleResolver,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'

import { wrapModuleWithType } from '../wrapModuleWithType'

export interface ModuleProxyResolverOptions {
  childAddressMap: Record<Address, ModuleName | null>
  host: ModuleResolver
  module: ModuleInstance
}

export class ModuleProxyResolver<T extends ModuleProxyResolverOptions = ModuleProxyResolverOptions> implements ModuleResolverInstance {
  private downResolver = new CompositeModuleResolver()

  constructor(private options: T) {}

  protected get childAddressMap() {
    return this.options.childAddressMap
  }

  protected get host() {
    return this.options.host
  }

  protected get module() {
    return this.options.module
  }

  addResolver(_resolver: ModuleResolver): this {
    throw new Error('Not supported')
  }

  removeResolver(_resolver: ModuleResolver): this {
    throw new Error('Not supported')
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
    //console.log(`childAddressMap: ${toJsonString(this.childAddressMap, 10)}`)
    const direction = options?.direction ?? 'all'
    if (idOrFilter === '*') {
      //get all the child addresses.  if they have been resolved before, they should be in downResolver
      const childAddresses = Object.keys(this.childAddressMap)
      const resolvedChildren = await Promise.all(childAddresses.map<Promise<T | undefined>>((address) => this.resolve<T>(address, options)))
      return resolvedChildren.filter(exists)
    } else if (typeof idOrFilter === 'string') {
      const idParts = idOrFilter.split(':')
      const firstPart: ModuleIdentifier = assertEx(idParts.shift(), () => 'Invalid module identifier at first position')
      const remainingParts = idParts.length > 0 ? idParts.join(':') : undefined
      if (direction === 'down' || direction === 'all') {
        const downResolverModule = await this.downResolver.resolve<T>(firstPart)
        if (downResolverModule) {
          return remainingParts ? downResolverModule.resolve(remainingParts, options) : downResolverModule
        }
        //if it is a known child, create a proxy
        const addressToProxy =
          Object.keys(this.childAddressMap).includes(firstPart as Address) ?
            (firstPart as Address)
          : (Object.entries(this.childAddressMap).find(([_, value]) => value === firstPart)?.[0] as Address | undefined)
        if (addressToProxy) {
          const proxy = await this.host.resolve(addressToProxy, { ...options, direction: 'down' })
          if (proxy) {
            const wrapped = wrapModuleWithType(proxy, Account.randomSync()) as unknown as T
            return remainingParts ? wrapped?.resolve(remainingParts, options) : wrapped
          }
          return
        }
      } else {
        return
      }
    } else {
      const filter = idOrFilter
      if (isAddressModuleFilter(filter)) {
        const results = (await Promise.all(filter.address.map((item) => this.resolve(item, options)))).filter(exists)
        return results
      } else if (isNameModuleFilter(filter)) {
        return (await Promise.all(filter.name.map((item) => this.resolve(item, options)))).filter(exists)
      }
    }
  }

  resolveIdentifier(id: ModuleIdentifier): Promisable<Address | undefined> {
    return undefined
  }
}
