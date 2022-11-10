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
    const filteredByConfigSchema =
      compact(
        flatten(
          filter?.config?.map((schema) => {
            return Object.values(this.modules).filter((module) => module.config.schema === schema)
          }),
        ),
      ) ?? Object.values(this.modules)

    return compact(
      filteredByConfigSchema.filter((module) =>
        filter?.query?.map((queryList) => {
          return queryList.reduce((supported, query) => {
            return supported && module.queryable(query)
          }, true)
        }),
      ),
    )
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
