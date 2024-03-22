import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import {
  isAddressModuleFilter,
  isNameModuleFilter,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleResolver,
  ModuleResolverInstance,
} from '@xyo-network/module-model'

export interface ModuleProxyResolverOptions {
  childAddresses: Address[]
  host: ModuleResolver
}

export class ModuleProxyResolver<T extends ModuleProxyResolverOptions = ModuleProxyResolverOptions> implements ModuleResolverInstance {
  constructor(protected options: T) {}

  addResolver(_resolver: ModuleResolver): this {
    throw new Error('Not supported')
  }

  removeResolver(_resolver: ModuleResolver): this {
    throw new Error('Not supported')
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve(): Promise<ModuleInstance[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleFilter<T> | ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const direction = options?.direction ?? 'all'
    if (idOrFilter === '*') {
      const downModules =
        direction === 'down' || direction === 'all' ?
          await this.options.host.resolve({ address: this.options.childAddresses }, { ...options, direction: 'down' })
        : []
      const upModules = direction === 'up' || direction === 'all' ? await this.options.host.resolve('*', { ...options, direction: 'up' }) : []
      //for '*', we never create a proxy
      return [...downModules, ...upModules]
    } else if (typeof idOrFilter === 'string') {
      //check down
      let module =
        direction === 'down' || direction === 'all' ? await this.options.host.resolve(idOrFilter, { ...options, direction: 'down' }) : undefined
      //if not found, check up
      if (!module) {
        module =
          direction === 'up' || direction === 'all' ? await this.options.host.resolve(idOrFilter, { ...options, direction: 'down' }) : undefined
      }
      //if not found, create proxy
      if (!module) {
        module =
          direction === 'down' || direction === 'all' ? await this.options.host.resolve(idOrFilter, { ...options, direction: 'down' }) : undefined
      }
      return module
    } else {
      const filter = idOrFilter
      if (isAddressModuleFilter(filter)) {
        const results = (await Promise.all(filter.address.map((item) => this.resolve(item, options)))).filter(exists)
        return results
      } else if (isNameModuleFilter(filter)) {
        return (await Promise.all(filter.name.map((item) => this.resolve(item, options)))).filter(exists)
      }
    }
  }
}
