import { compact, flatten } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import {
  AddressModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleRepository,
  ModuleResolver,
  NameModuleFilter,
  QueryModuleFilter,
} from '@xyo-network/module-model'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver implements ModuleRepository {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, ModuleInstance> = {}

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

  addResolver(_resolver: ModuleResolver): this {
    throw 'Adding resolvers not supported'
  }

  remove(address: string | string[]): this {
    if (Array.isArray(address)) {
      address.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  removeResolver(_resolver: ModuleResolver): this {
    throw 'Removing resolvers not supported'
  }

  resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promisable<T[]>
  resolve<T extends ModuleInstance = ModuleInstance>(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promisable<T | undefined>
  resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T[] | T | undefined> {
    const unfiltered = (() => {
      if (nameOrAddressOrFilter) {
        if (typeof nameOrAddressOrFilter === 'string') {
          return (
            this.resolveByName<T>(Object.values(this.modules), [nameOrAddressOrFilter]).pop() ??
            this.resolveByAddress<T>(Object.values(this.modules), [nameOrAddressOrFilter]).pop()
          )
        } else if ((nameOrAddressOrFilter as AddressModuleFilter).address) {
          return this.resolveByAddress<T>(Object.values(this.modules), (nameOrAddressOrFilter as AddressModuleFilter).address)
        } else if ((nameOrAddressOrFilter as NameModuleFilter).name) {
          return this.resolveByName<T>(Object.values(this.modules), (nameOrAddressOrFilter as NameModuleFilter).name)
        } else if ((nameOrAddressOrFilter as QueryModuleFilter).query) {
          return this.resolveByQuery<T>(Object.values(this.modules), (nameOrAddressOrFilter as QueryModuleFilter).query)
        }
      } else {
        return Object.values(this.modules) as T[]
      }
    })()
    const identity = options?.identity
    if (identity) {
      return Array.isArray(unfiltered) ? unfiltered?.filter((module) => identity(module)) : identity(unfiltered) ? unfiltered : undefined
    } else {
      return unfiltered
    }
  }

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      this.modules[module.address] = module
    }
  }

  private removeSingleModule(address: string) {
    if (address) {
      if (this.modules[address]) {
        delete this.modules[address]
        const name = this.addressToName[address]
        if (name) {
          delete this.addressToName[address]
        }
      }
    }
  }

  private resolveByAddress<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], address?: string[]): T[] {
    return (
      address
        ? compact(
            flatten(
              address?.map((address) => {
                return modules.filter((module) => module.address === address)
              }),
            ),
          )
        : modules
    ) as T[]
  }

  private resolveByName<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], name?: string[]): T[] {
    if (name) {
      return compact(name.map((name) => modules.filter((module) => module.config?.name === name)).flat()) as T[]
    }
    return modules as T[]
  }

  private resolveByQuery<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], query?: string[][]): T[] {
    return (
      query
        ? compact(
            modules.filter(
              (module) =>
                query?.reduce((supported, queryList) => {
                  return (
                    queryList.reduce((supported, query) => {
                      const queryable = module.queries.includes(query)
                      return supported && queryable
                    }, true) || supported
                  )
                }, false),
            ),
          )
        : modules
    ) as T[]
  }
}
