import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'
import flatten from 'lodash/flatten'

import { ModuleFilter } from './Module'
import { ModuleResolver } from './ModuleResolver'
import { XyoModule } from './XyoModule'

export class XyoModuleResolver<TModule extends XyoModule = XyoModule> implements ModuleResolver {
  private modules: Record<string, TModule> = {}

  public get isModuleResolver() {
    return true
  }

  add(module?: TModule | TModule[]) {
    if (Array.isArray(module)) {
      module.forEach((module) => this.addSingleModule(module))
    } else {
      this.addSingleModule(module)
    }
    return this
  }

  remove(address?: string | string[]) {
    if (Array.isArray(address)) {
      address.forEach((address) => this.removeSingleModule(address))
    } else {
      this.removeSingleModule(address)
    }
    return this
  }

  resolve(filter?: ModuleFilter): Promisable<TModule[]> {
    const filteredByAddress = filter?.address
      ? compact(
          flatten(
            filter?.address?.map((address) => {
              return this.modules[address]
            }),
          ),
        )
      : Object.values(this.modules)

    const filteredByConfigSchema = filter?.config
      ? compact(
          flatten(
            filter?.config?.map((schema) => {
              return filteredByAddress.filter((module) => module.config.schema === schema)
            }),
          ),
        )
      : filteredByAddress

    const filteredByQuery = filter?.query
      ? compact(
          filteredByConfigSchema.filter((module) =>
            filter?.query?.reduce((supported, queryList) => {
              return (
                queryList.reduce((supported, query) => {
                  const queryable = module.queryable(query)
                  return supported && queryable
                }, true) || supported
              )
            }, false),
          ),
        )
      : filteredByConfigSchema

    return filteredByQuery
  }

  private addSingleModule(module?: TModule) {
    if (module) {
      this.modules[module.address] = module
    }
  }

  private removeSingleModule(address?: string) {
    if (address) {
      delete this.modules[address]
    }
  }
}
