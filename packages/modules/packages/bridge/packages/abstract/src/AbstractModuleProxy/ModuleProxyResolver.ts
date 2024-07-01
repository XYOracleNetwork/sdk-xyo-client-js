import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import {
  isAddressModuleFilter,
  isNameModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleIdentifierTransformer,
  ModuleInstance,
  ModuleName,
  ModuleResolver,
  ModuleResolverInstance,
  ObjectFilterOptions,
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { CompositeModuleResolver } from '@xyo-network/module-resolver'

import { wrapModuleWithType } from '../wrapModuleWithType'

export interface ModuleProxyResolverOptions {
  childAddressMap: Record<Address, ModuleName | null>
  childManifests?: Record<Address, ModuleManifestPayload>
  childStates?: Record<Address, ModuleManifestPayload>
  host: ModuleResolver
  mod: ModuleInstance
  moduleIdentifierTransformers?: ModuleIdentifierTransformer[]
}

export class ModuleProxyResolver<T extends ModuleProxyResolverOptions = ModuleProxyResolverOptions> implements ModuleResolverInstance {
  private downResolver: CompositeModuleResolver

  constructor(private options: T) {
    this.downResolver = new CompositeModuleResolver({ moduleIdentifierTransformers: options.moduleIdentifierTransformers, root: this.root })
  }

  get priority() {
    return ObjectResolverPriority.VeryLow
  }

  get root() {
    return this.options.mod
  }

  protected get childAddressMap() {
    return this.options.childAddressMap
  }

  protected get host() {
    return this.options.host
  }

  protected get mod() {
    return this.options.mod
  }

  addResolver(_resolver: ModuleResolver): this {
    throw new Error('Not supported')
  }

  childManifest(address: Address) {
    return this.options.childManifests?.[address]
  }

  childState(address: Address) {
    return this.options.childStates?.[address]
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
  // eslint-disable-next-line complexity
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
      const firstPartAddress = await this.resolveIdentifier(firstPart)
      if (firstPartAddress) {
        const remainingParts = idParts.length > 0 ? idParts.join(':') : undefined
        if (direction === 'down' || direction === 'all') {
          const downResolverModule = await this.downResolver.resolve<T>(firstPartAddress)
          if (downResolverModule) {
            return remainingParts ? downResolverModule.resolve(remainingParts, options) : downResolverModule
          }

          console.log(`ModuleProxyResolver: ${firstPartAddress} | ${this.root.address}`)
          if (firstPartAddress === this.root.address) {
            const wrapped = wrapModuleWithType(this.root, Account.randomSync()) as unknown as T
            return remainingParts ? wrapped?.resolve(remainingParts, options) : wrapped
          }

          //if it is a known child, create a proxy
          const addressToProxy =
            Object.keys(this.childAddressMap).includes(firstPartAddress as Address) ?
              (firstPartAddress as Address)
            : (Object.entries(this.childAddressMap).find(([_, value]) => value === firstPartAddress)?.[0] as Address | undefined)
          if (addressToProxy) {
            const proxy = await this.host.resolve(addressToProxy, { ...options, direction: 'down' })
            if (proxy) {
              const wrapped = wrapModuleWithType(proxy, Account.randomSync()) as unknown as T
              return remainingParts ? wrapped?.resolve(remainingParts, options) : wrapped
            }
            return
          }
        }
      }
      return
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

  resolveIdentifier(id: ModuleIdentifier, _options?: ObjectFilterOptions): Promisable<Address | undefined> {
    //check if any of the modules have the id as an address
    if (this.childAddressMap[id as Address]) {
      return id as Address
    }

    if (this.root.address === id) {
      return this.root.address
    }

    if (this.root.modName === id) {
      return this.root.address
    }

    //check if id is a name of one of modules in the resolver
    const addressFromName = Object.entries(this.childAddressMap).find(([, name]) => name === id)?.[0] as Address | undefined
    if (addressFromName) {
      return addressFromName
    }
  }

  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ObjectFilterOptions<T>): Promise<T[]>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promise<T | undefined>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    _options?: ObjectFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (id === '*') return await Promise.resolve([])
  }
}
