import { Address } from '@xylabs/hex'
import { compact, flatten } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import {
  isAddressModuleFilter,
  isNameModuleFilter,
  isQueryModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleRepository,
  ModuleResolverInstance,
} from '@xyo-network/module-model'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver implements ModuleRepository {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, ModuleInstance> = {}

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

  resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promisable<T[]>
  resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promisable<T | undefined>
  resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T[] | T | undefined> {
    const unfiltered = (() => {
      if (idOrFilter) {
        if (typeof idOrFilter === 'string') {
          const id = idOrFilter
          return this.resolveByName<T>(Object.values(this.modules), [id]).pop() ?? this.resolveByAddress<T>(Object.values(this.modules), [id]).pop()
        } else {
          const filter = idOrFilter
          if (isAddressModuleFilter(filter)) {
            return this.resolveByAddress<T>(Object.values(this.modules), filter.address)
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

  private addSingleModule(module?: ModuleInstance) {
    if (module) {
      this.modules[module.address] = module
    }
  }

  private removeSingleModule(address: Address) {
    if (address && this.modules[address]) {
      delete this.modules[address]
      const name = this.addressToName[address]
      if (name) {
        delete this.addressToName[address]
      }
    }
  }

  private resolveByAddress<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], address?: string[]): T[] {
    return (
      address ?
        compact(
          flatten(
            address?.map((address) => {
              return modules.filter((module) => module.address === address)
            }),
          ),
        )
      : modules) as T[]
  }

  private resolveByName<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], name?: string[]): T[] {
    if (name) {
      return compact(name.flatMap((name) => modules.filter((module) => module.config?.name === name))) as T[]
    }
    return modules as T[]
  }

  private resolveByQuery<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], query?: string[][]): T[] {
    return (
      query ?
        compact(
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
        )
      : modules) as T[]
  }
}
