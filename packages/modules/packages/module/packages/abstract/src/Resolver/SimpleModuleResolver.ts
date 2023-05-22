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

  resolve<T extends Module = Module>(filter?: ModuleFilter): Promisable<T[]> {
    const filteredByName: T[] = this.resolveByName<T>(Object.values(this.modules) as T[], (filter as NameModuleFilter)?.name)

    const filteredByAddress: T[] = (filter as AddressModuleFilter)?.address
      ? this.resolveByAddress<T>(filteredByName, (filter as AddressModuleFilter)?.address)
      : filteredByName

    const filteredByQuery: T[] = (filter as QueryModuleFilter)?.query
      ? this.resolveByQuery<T>(filteredByAddress, (filter as QueryModuleFilter)?.query)
      : filteredByAddress

    return filteredByQuery
  }

  resolveOne<T extends Module = Module>(filter: string): Promisable<T | undefined> {
    const allModules = Object.values(this.modules) as T[]
    for (const resolutionMethod of [this.resolveByAddress<T>, this.resolveByName<T>]) {
      const filtered: T[] = resolutionMethod(allModules, [filter])
      if (filtered.length === 1) return filtered[0]
    }
    return undefined
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
