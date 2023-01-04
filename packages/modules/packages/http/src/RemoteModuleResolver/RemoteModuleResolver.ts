import { fulfilled } from '@xylabs/promise'
import { XyoApiConfig } from '@xyo-network/api-models'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleRepository } from '@xyo-network/module-model'

import { HttpProxyModule } from '../HttpProxyModule'

interface LocalModuleFilter {
  config?: string[]
  query?: string[][]
}

interface RemoteModuleFilter {
  address?: string[]
  name?: string[]
}

export class RemoteModuleResolver implements ModuleRepository {
  private resolvedModules: Record<string, HttpProxyModule> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly apiConfig: XyoApiConfig) {}

  public get isModuleResolver(): boolean {
    return true
  }

  add(module: Module, name?: string | undefined): this
  add(module: Module[], name?: string[] | undefined): this
  add(module: Module | Module[], name?: string | string[] | undefined): this
  add(_module: unknown, _name?: unknown): this {
    throw new Error('Method not implemented.')
  }

  remove(name: string | string[]): this
  remove(address: string | string[]): this
  remove(_address: unknown): this {
    throw new Error('Method not implemented.')
  }

  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    return this.filterLocalModules(await Promise.all(this.resolveRemoteModules(filter)), filter)
  }

  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    const settled = await Promise.allSettled(this.resolveRemoteModules(filter))
    return this.filterLocalModules(
      settled.filter(fulfilled).map((r) => r.value),
      filter,
    )
  }

  private filterLocalModules(mods: Module[], filter?: LocalModuleFilter): Module[] {
    // TODO: Handle filter?.query
    if (filter?.query) throw new Error('Filtering by config not yet supported by this resolver')
    const config = filter?.config
    const filtered = config?.length ? mods.filter((mod) => config.includes(mod.config.schema)) : mods
    return filtered
  }

  private async resolveByAddress(address: string): Promise<HttpProxyModule> {
    const cached = this.resolvedModules[address]
    if (cached) return cached
    const mod = await HttpProxyModule.create({ address, apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema } })
    this.resolvedModules[address] = mod
    return mod
  }

  private async resolveByName(name: string): Promise<HttpProxyModule> {
    const cached = this.resolvedModules[name]
    if (cached) return cached
    const mod = await HttpProxyModule.create({ apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema }, name })
    this.resolvedModules[name] = mod
    this.resolvedModules[mod.address] = mod
    return mod
  }

  private resolveRemoteModules(filter?: RemoteModuleFilter): Promise<HttpProxyModule>[] {
    const addresses = filter?.address
    const names = filter?.name
    const byAddress = addresses?.map((address) => this.resolveByAddress(address)) || []
    const byName = names?.map((name) => this.resolveByName(name)) || []
    return [...byAddress, ...byName]
  }
}
