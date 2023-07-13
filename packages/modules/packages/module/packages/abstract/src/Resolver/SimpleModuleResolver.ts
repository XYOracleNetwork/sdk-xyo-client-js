import {
  AddressModuleFilter,
  IndirectModule,
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
  private modules: Record<string, IndirectModule> = {}

  get isModuleResolver() {
    return true
  }

  add(module: IndirectModule): this
  add(module: IndirectModule[]): this
  add(module: IndirectModule | IndirectModule[]): this {
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

  resolve<TModule extends IndirectModule = IndirectModule>(filter?: ModuleFilter): Promisable<TModule[]>
  resolve<TModule extends IndirectModule = IndirectModule>(nameOrAddress: string): Promisable<TModule | undefined>
  resolve<TModule extends IndirectModule = IndirectModule>(
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promisable<TModule | TModule[] | undefined> {
    if (nameOrAddressOrFilter) {
      if (typeof nameOrAddressOrFilter === 'string') {
        return (
          this.resolveByName(Object.values(this.modules) as TModule[], [nameOrAddressOrFilter]).pop() ??
          this.resolveByAddress(Object.values(this.modules) as TModule[], [nameOrAddressOrFilter]).pop()
        )
      } else if ((nameOrAddressOrFilter as AddressModuleFilter).address) {
        return this.resolveByAddress<TModule>(Object.values(this.modules) as TModule[], (nameOrAddressOrFilter as AddressModuleFilter).address)
      } else if ((nameOrAddressOrFilter as NameModuleFilter).name) {
        return this.resolveByName<TModule>(Object.values(this.modules) as TModule[], (nameOrAddressOrFilter as NameModuleFilter).name)
      } else if ((nameOrAddressOrFilter as QueryModuleFilter).query) {
        return this.resolveByQuery<TModule>(Object.values(this.modules) as TModule[], (nameOrAddressOrFilter as QueryModuleFilter).query)
      }
    } else {
      return Object.values(this.modules) as TModule[]
    }
  }

  private addSingleModule(module?: IndirectModule) {
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

  private resolveByAddress<T extends IndirectModule = IndirectModule>(modules: T[], address?: string[]): T[] {
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

  private resolveByName<T extends IndirectModule = IndirectModule>(modules: T[], name?: string[]): T[] {
    if (name) {
      return compact(name.map((name) => modules.filter((module) => module.config.name === name)).flat())
    }
    return modules
  }

  private resolveByQuery<T extends IndirectModule = IndirectModule>(modules: T[], query?: string[][]): T[] {
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
