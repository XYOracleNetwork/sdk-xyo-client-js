import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { AbstractModule } from './AbstractModule'
import { ModuleResolver } from './model'
import { ModuleFilter } from './ModuleFilter'

export class SimpleModuleResolver<TModule extends AbstractModule = AbstractModule> implements ModuleResolver {
  private addressToName: Record<string, string> = {}
  private modules: Record<string, TModule> = {}
  private nameToAddress: Record<string, string> = {}

  public get isModuleResolver() {
    return true
  }

  add(module: TModule, name?: string): SimpleModuleResolver
  add(module: TModule[], name?: string[]): SimpleModuleResolver
  add(module: TModule | TModule[], name?: string | string[]) {
    if (Array.isArray(module)) {
      const nameArray = name ? assertEx(Array.isArray(name) ? name : undefined, 'name must be array or undefined') : undefined
      assertEx((nameArray?.length ?? module.length) === module.length, 'names/modules array mismatch')
      module.forEach((module, index) => this.addSingleModule(module, nameArray?.[index]))
    } else {
      this.addSingleModule(module, typeof name === 'string' ? name : undefined)
    }
    return this
  }

  remove(name: string | string[]): SimpleModuleResolver
  remove(address: string | string[]): SimpleModuleResolver {
    if (Array.isArray(address)) {
      address.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  resolve(filter?: ModuleFilter): Promisable<TModule[]> {
    const filteredByName: TModule[] = this.resolveByName(Object.values(this.modules), filter?.name)

    const filteredByAddress = this.resolveByAddress(filteredByName, filter?.address)

    const filteredByConfigSchema = this.resolveByConfigSchema(filteredByAddress, filter?.config)

    const filteredByQuery = this.resolveByQuery(filteredByConfigSchema, filter?.query)

    return filteredByQuery
  }

  async tryResolve(filter?: ModuleFilter): Promise<TModule[]> {
    try {
      return await this.resolve(filter)
    } catch (ex) {
      return []
    }
  }

  private addSingleModule(module?: TModule, name?: string) {
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

  private resolveByConfigSchema(modules: TModule[], schema?: string[]): TModule[] {
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

  private resolveByName(modules: TModule[], name?: string[]) {
    if (name) {
      const address = name.map((name) => assertEx(this.nameToAddress[name], 'name not found'))
      return this.resolveByAddress(modules, address)
    }
    return modules
  }

  private resolveByQuery(modules: TModule[], query?: string[][]) {
    return query
      ? compact(
          modules.filter((module) =>
            query?.reduce((supported, queryList) => {
              return (
                queryList.reduce((supported, query) => {
                  const queryable = module.queryable(query)
                  return supported && queryable
                }, true) || supported
              )
            }, false),
          ),
        )
      : modules
  }
}
