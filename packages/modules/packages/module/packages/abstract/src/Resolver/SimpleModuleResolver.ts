import {
  AddressModuleFilter,
  Module,
  ModuleFilter,
  ModuleRepository,
  ModuleResolver,
  NameModuleFilter,
  QueryModuleFilter,
} from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver implements ModuleRepository {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, Module> = {}

  get isModuleResolver() {
    return true
  }

  add(module: Module): this
  add(module: Module[]): this
  add(module: Module | Module[]): this {
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

  resolve(filter?: ModuleFilter): Promisable<Module[]>
  resolve(nameOrAddress: string): Promisable<Module | undefined>
  resolve(nameOrAddressOrFilter?: ModuleFilter | string): Promisable<Module | Module[] | undefined> {
    if (nameOrAddressOrFilter) {
      if (typeof nameOrAddressOrFilter === 'string') {
        return (
          this.resolveByName(Object.values(this.modules), [nameOrAddressOrFilter]).pop() ??
          this.resolveByAddress(Object.values(this.modules), [nameOrAddressOrFilter]).pop()
        )
      } else if ((nameOrAddressOrFilter as AddressModuleFilter).address) {
        return this.resolveByAddress(Object.values(this.modules), (nameOrAddressOrFilter as AddressModuleFilter).address)
      } else if ((nameOrAddressOrFilter as NameModuleFilter).name) {
        return this.resolveByName(Object.values(this.modules), (nameOrAddressOrFilter as NameModuleFilter).name)
      } else if ((nameOrAddressOrFilter as QueryModuleFilter).query) {
        return this.resolveByQuery(Object.values(this.modules), (nameOrAddressOrFilter as QueryModuleFilter).query)
      }
    } else {
      return Object.values(this.modules)
    }
  }

  private addSingleModule(module?: Module) {
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

  private resolveByAddress<T extends Module = Module>(modules: T[], address?: string[]): T[] {
    return address
      ? compact(
          flatten(
            address?.map((address) => {
              return modules.filter((module) => module.address === address)
            }),
          ),
        )
      : modules
  }

  private resolveByName<T extends Module = Module>(modules: T[], name?: string[]): T[] {
    if (name) {
      return compact(name.map((name) => modules.filter((module) => module.config.name === name)).flat())
    }
    return modules
  }

  private resolveByQuery<T extends Module = Module>(modules: T[], query?: string[][]): T[] {
    return query
      ? compact(
          modules.filter((module) =>
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
  }
}
