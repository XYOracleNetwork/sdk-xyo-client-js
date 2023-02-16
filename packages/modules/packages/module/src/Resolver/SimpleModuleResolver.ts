import { assertEx } from '@xylabs/assert'
import { Module, ModuleFilter, ModuleRepository } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

//This class is now package private (not exported from index.ts)
export class SimpleModuleResolver implements ModuleRepository {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, Module> = {}
  private nameToAddress: Record<string, string> = {}

  public get isModuleResolver() {
    return true
  }

  add(module: Module, name?: string): this
  add(module: Module[], name?: string[]): this
  add(module: Module | Module[], name?: string | string[]): this {
    if (Array.isArray(module)) {
      const nameArray = name ? assertEx(Array.isArray(name) ? name : undefined, 'name must be array or undefined') : undefined
      assertEx((nameArray?.length ?? module.length) === module.length, 'names/modules array mismatch')
      module.forEach((module, index) => this.addSingleModule(module, nameArray?.[index]))
    } else {
      this.addSingleModule(module, typeof name === 'string' ? name : undefined)
    }
    return this
  }

  remove(name: string | string[]): this
  remove(address: string | string[]): this {
    if (Array.isArray(address)) {
      address.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  resolve(filter?: ModuleFilter): Promisable<Module[]> {
    const filteredByName: Module[] = this.resolveByName(Object.values(this.modules), filter?.name)

    const filteredByAddress: Module[] = filter?.address ? this.resolveByAddress(filteredByName, filter?.address) : filteredByName

    const filteredByConfigSchema: Module[] = filter?.config ? this.resolveByConfigSchema(filteredByAddress, filter?.config) : filteredByAddress

    const filteredByQuery: Module[] = filter?.query ? this.resolveByQuery(filteredByConfigSchema, filter?.query) : filteredByConfigSchema

    return filteredByQuery
  }

  private addSingleModule(module?: Module, name?: string) {
    if (module) {
      this.modules[module.address] = module
      if (name) {
        this.nameToAddress[name] = module.address
        this.addressToName[module.address] = name
      }
    }
  }

  private removeSingleModule(addressOrName: string) {
    const resolvedAddress = this.modules[addressOrName] ? addressOrName : this.nameToAddress[addressOrName]
    if (resolvedAddress) {
      if (this.modules[resolvedAddress]) {
        delete this.modules[resolvedAddress]
        const name = this.addressToName[resolvedAddress]
        if (name) {
          delete this.nameToAddress[name]
          delete this.addressToName[resolvedAddress]
        }
      }
    }
  }

  private resolveByAddress(modules: Module[], address?: string[]): Module[] {
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

  private resolveByConfigSchema(modules: Module[], schema?: string[]): Module[] {
    return schema
      ? compact(
          flatten(
            schema?.map((schema) => {
              return modules.filter((module) => module.config.schema === schema)
            }),
          ),
        )
      : modules
  }

  private resolveByName(modules: Module[], name?: string[]) {
    if (name) {
      const address = compact(name.map((name) => this.nameToAddress[name]))
      return this.resolveByAddress(modules, address)
    }
    return modules
  }

  private resolveByQuery(modules: Module[], query?: string[][]) {
    return query
      ? compact(
          modules.filter((module) =>
            query?.reduce((supported, queryList) => {
              return (
                queryList.reduce((supported, query) => {
                  const queryable = module.queries().includes(query)
                  return supported && queryable
                }, true) || supported
              )
            }, false),
          ),
        )
      : modules
  }
}
