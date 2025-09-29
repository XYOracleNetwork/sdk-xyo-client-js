import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import type { Address } from '@xylabs/hex'
import { isAddress } from '@xylabs/hex'
import type { Promisable } from '@xylabs/promise'
import type {
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleName,
  ModuleRepository,
  ModuleResolverInstance,
  ObjectFilterOptions,
} from '@xyo-network/module-model'
import { isModuleName } from '@xyo-network/module-model'

import type { ModuleResolverParams } from './AbstractModuleResolver.ts'
import { AbstractModuleResolver } from './AbstractModuleResolver.ts'

export type SimpleModuleResolverParams = ModuleResolverParams & {
  allowNameResolution?: boolean
}

export class SimpleModuleResolver extends AbstractModuleResolver<SimpleModuleResolverParams> implements ModuleRepository {
  private modules: Record<Address, ModuleInstance> = {}
  private nameToModule: Record<ModuleName, ModuleInstance> = {}

  constructor(params: SimpleModuleResolverParams) {
    super(params)
  }

  get allowNameResolution() {
    return this.params.allowNameResolution ?? true
  }

  add(mods: ModuleInstance): this
  add(mods: ModuleInstance[]): this
  add(mods: ModuleInstance | ModuleInstance[]): this {
    if (Array.isArray(mods)) {
      for (const mod of mods) this.addSingleModule(mod)
    } else {
      this.addSingleModule(mods)
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

  resolveHandler<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promisable<T[]> {
    const unfiltered = (() => {
      if (id) {
        if (typeof id === 'string') {
          if (id === '*') {
            return Object.values(this.modules) as T[]
          }
          const name = isModuleName(id) ? id : undefined
          const address = isAddress(id) ? id : undefined
          assertEx(name || address, () => 'module identifier must be a ModuleName or Address')
          return (
            (name ? this.resolveByName<T>(Object.values(this.modules), [name]).pop() : undefined)
            ?? (address ? this.resolveByAddress<T>(this.modules, [address]).pop() : undefined)
          )
        }
      } else {
        return Object.values(this.modules) as T[]
      }
    })()
    const identity = options?.identity
    if (identity) {
      return (
        Array.isArray(unfiltered)
          ? unfiltered?.filter(mod => identity(mod))
          : identity(unfiltered)
            ? [unfiltered]
            : []
      )
    } else {
      return (
        unfiltered
          ? Array.isArray(unfiltered)
            ? unfiltered
            : [unfiltered]
          : []
      )
    }
  }

  resolveIdentifier(id: ModuleIdentifier, _options?: ObjectFilterOptions): Promisable<Address | undefined> {
    // check if id is a name of one of modules in the resolver
    const moduleFromName = this.nameToModule[id]
    if (moduleFromName) {
      return moduleFromName.address
    }

    // check if any of the modules have the id as an address
    for (const mod of Object.values(this.modules)) {
      if (mod.address === id) {
        return mod.address
      }
    }
  }

  private addSingleModule(mod?: ModuleInstance) {
    if (mod) {
      const modName = mod.modName
      if (modName && this.allowNameResolution) {
        // check for collision
        assertEx(this.nameToModule[modName] === undefined, () => `Module with name ${modName} already added`)
        this.nameToModule[modName] = mod
      }
      this.modules[mod.address] = mod
    }
  }

  private removeSingleModule(address: Address) {
    assertEx(isAddress(address), () => 'Invalid address')
    const mod = assertEx(this.modules[address], () => 'Address not found in modules')
    delete this.modules[address]
    const modName = mod.modName
    if (modName) {
      delete this.nameToModule[modName]
    }
  }

  private resolveByAddress<T extends ModuleInstance = ModuleInstance>(modules: Record<Address, ModuleInstance>, address: Address[]): T[] {
    return (
      address.map((address) => {
        return modules[address]
      })
    ).filter(exists) as T[]
  }

  private resolveByName<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], name: ModuleName[]): T[] {
    return (
      name.map((name) => {
        return modules.find(mod => mod.modName === name)
      })
    ).filter(exists) as T[]
  }

  private resolveByQuery<T extends ModuleInstance = ModuleInstance>(modules: ModuleInstance[], query: string[][]): T[] {
    return (
      modules.filter(mod =>
        // eslint-disable-next-line unicorn/no-array-reduce
        query?.reduce((supported, queryList) => {
          return (
            // eslint-disable-next-line unicorn/no-array-reduce
            queryList.reduce((supported, query) => {
              const queryable = mod.queries.includes(query)
              return supported && queryable
            }, true) || supported
          )
        }, false))
    ).filter(exists) as T[]
  }
}
