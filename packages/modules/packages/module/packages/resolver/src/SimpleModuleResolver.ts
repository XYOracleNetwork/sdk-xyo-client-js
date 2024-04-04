import { assertEx } from '@xylabs/assert'
import { Address, isAddress } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import {
  isAddressModuleFilter,
  isModuleName,
  isNameModuleFilter,
  isQueryModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleName,
  ModuleRepository,
  ModuleResolverInstance,
  ObjectFilterOptions,
} from '@xyo-network/module-model'

import { AbstractModuleResolver, ModuleResolverParams } from './AbstractModuleResolver'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver extends AbstractModuleResolver implements ModuleRepository {
  private modules: Record<Address, ModuleInstance> = {}
  private nameToModule: Record<ModuleName, ModuleInstance> = {}

  constructor(params: ModuleResolverParams) {
    super(params)
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

  addResolver(_resolver: ModuleResolverInstance): this {
    throw 'Adding resolvers not supported'
  }

  remove(address: Address | Address[]): this {
    if (Array.isArray(address)) {
      for (const addr of address) this.removeSingleModule(addr)
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  removeResolver(_resolver: ModuleResolverInstance): this {
    throw 'Removing resolvers not supported'
  }

  resolveHandler<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | string = '*',
    options?: ModuleFilterOptions<T>,
  ): Promisable<T[] | T | undefined> {
    const unfiltered = (() => {
      if (idOrFilter) {
        if (typeof idOrFilter === 'string') {
          if (idOrFilter === '*') {
            return Object.values(this.modules) as T[]
          }
          const id = idOrFilter as ModuleIdentifier
          const name = isModuleName(id) ? id : undefined
          const address = isAddress(id) ? id : undefined
          assertEx(name || address, () => 'module identifier must be a ModuleName or Address')
          return (
            (name ? this.resolveByName<T>(Object.values(this.modules), [name]).pop() : undefined) ??
            (address ? this.resolveByAddress<T>(this.modules, [address]).pop() : undefined)
          )
        } else {
          const filter = idOrFilter
          if (isAddressModuleFilter(filter)) {
            return this.resolveByAddress<T>(this.modules, filter.address)
          } else if (isNameModuleFilter(filter)) {
            return this.resolveByName<T>(Object.values(this.modules), filter.name)
          } else if (isQueryModuleFilter(filter)) {
            return this.resolveByQuery<T>(Object.values(this.modules), filter.query)
          }
        }
      } else {
        return Object.values(this.modules) as T[]
      }
    })()
    const identity = options?.identity
    if (identity) {
      return (
        Array.isArray(unfiltered) ? unfiltered?.filter((module) => identity(module))
        : identity(unfiltered) ? unfiltered
        : undefined
      )
    } else {
      return unfiltered
    }
  }

  resolveIdentifier(id: ModuleIdentifier, _options?: ObjectFilterOptions): Promisable<Address | undefined> {
    //check if id is a name of one of modules in the resolver
    const moduleFromName = this.nameToModule[id]
    if (moduleFromName) {
      return moduleFromName.address
    }

    //check if any of the modules have the id as an address
    for (const module of Object.values(this.modules)) {
      if (module.address === id) {
        return module.address
      }
    }
  }

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      const name = module.config.name
      if (name) {
        //check for collision
        assertEx(this.nameToModule[name] === undefined, () => `Module with name ${name} already added`)
        this.nameToModule[name] = module
      }
      this.modules[module.address] = module
    }
  }

  private removeSingleModule(address: Address) {
    assertEx(isAddress(address), () => 'Invalid address')
    const module = assertEx(this.modules[address], () => 'Address not found in modules')
    delete this.modules[address]
    const name = module.config.name
    if (name) {
      delete this.nameToModule[name]
    }
  }

  private resolveByAddress<T extends ModuleInstance = ModuleInstance>(modules: Record<Address, ModuleInstance>, address: Address[]): T[] {
    return compact(
      address.map((address) => {
        return modules[address]
      }),
    ) as T[]
  }

  private resolveByName<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], name: ModuleName[]): T[] {
    return compact(
      name.map((name) => {
        return modules.find((module) => module.config.name === name)
      }),
    ) as T[]
  }

  private resolveByQuery<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], query: string[][]): T[] {
    return compact(
      modules.filter((module) =>
        query?.reduce((supported, queryList) => {
          return (
            // eslint-disable-next-line unicorn/no-array-reduce
            queryList.reduce((supported, query) => {
              const queryable = module.queries.includes(query)
              return supported && queryable
            }, true) || supported
          )
        }, false),
      ),
    ) as T[]
  }
}
