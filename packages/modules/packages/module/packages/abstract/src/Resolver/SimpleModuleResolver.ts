import {
  AddressModuleFilter,
  ModuleFilter,
  ModuleInstance,
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

  resolve(filter?: ModuleFilter): Promisable<ModuleInstance[]>
  resolve(nameOrAddress: string): Promisable<ModuleInstance | undefined>
  resolve(nameOrAddressOrFilter?: ModuleFilter | string): Promisable<ModuleInstance[] | ModuleInstance | undefined> {
    if (nameOrAddressOrFilter) {
      if (typeof nameOrAddressOrFilter === 'string') {
        const result: ModuleInstance | undefined =
          this.resolveByName(Object.values(this.modules), [nameOrAddressOrFilter]).pop() ??
          this.resolveByAddress(Object.values(this.modules), [nameOrAddressOrFilter]).pop()
        return result
      } else if ((nameOrAddressOrFilter as AddressModuleFilter).address) {
        const result: ModuleInstance[] = this.resolveByAddress(Object.values(this.modules), (nameOrAddressOrFilter as AddressModuleFilter).address)
        return result
      } else if ((nameOrAddressOrFilter as NameModuleFilter).name) {
        const result: ModuleInstance[] = this.resolveByName(Object.values(this.modules), (nameOrAddressOrFilter as NameModuleFilter).name)
        return result
      } else if ((nameOrAddressOrFilter as QueryModuleFilter).query) {
        return this.resolveByQuery(Object.values(this.modules), (nameOrAddressOrFilter as QueryModuleFilter).query)
      }
    } else {
      return Object.values(this.modules)
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

  private resolveByAddress<T extends ModuleInstance = ModuleInstance>(modules: T[], address?: string[]): T[] {
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

  private resolveByName<T extends ModuleInstance = ModuleInstance>(modules: T[], name?: string[]): T[] {
    if (name) {
      return compact(name.map((name) => modules.filter((module) => module.config.name === name)).flat())
    }
    return modules
  }

  private resolveByQuery<T extends ModuleInstance = ModuleInstance>(modules: T[], query?: string[][]): T[] {
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
