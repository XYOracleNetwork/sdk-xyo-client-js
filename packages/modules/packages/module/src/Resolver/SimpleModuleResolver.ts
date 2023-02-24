import { AddressModuleFilter, Module, ModuleFilter, ModuleRepository, NameModuleFilter, QueryModuleFilter } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver<TModule extends Module = Module> implements ModuleRepository<TModule> {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, TModule> = {}

  get isModuleResolver() {
    return true
  }

  add(module: TModule): this
  add(module: TModule[]): this
  add(module: TModule | TModule[]): this {
    if (Array.isArray(module)) {
      module.forEach((module) => this.addSingleModule(module))
    } else {
      this.addSingleModule(module)
    }
    return this
  }

  remove(address: string | string[]): this {
    if (Array.isArray(address)) {
      address.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  resolve(filter?: ModuleFilter): Promisable<TModule[]> {
    const filteredByName: TModule[] = this.resolveByName(Object.values(this.modules), (filter as NameModuleFilter)?.name)

    const filteredByAddress: TModule[] = (filter as AddressModuleFilter)?.address
      ? this.resolveByAddress(filteredByName, (filter as AddressModuleFilter)?.address)
      : filteredByName

    const filteredByQuery: TModule[] = (filter as QueryModuleFilter)?.query
      ? this.resolveByQuery(filteredByAddress, (filter as QueryModuleFilter)?.query)
      : filteredByAddress

    return filteredByQuery
  }

  private addSingleModule(module?: TModule) {
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

  private resolveByAddress(modules: TModule[], address?: string[]): TModule[] {
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

  private resolveByName(modules: TModule[], name?: string[]): TModule[] {
    if (name) {
      return compact(name.map((name) => modules.filter((module) => module.config.name === name)).flat())
    }
    return modules
  }

  private resolveByQuery(modules: TModule[], query?: string[][]): TModule[] {
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
