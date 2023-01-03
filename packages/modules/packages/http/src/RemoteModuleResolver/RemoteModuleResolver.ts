import { fulfilled } from '@xylabs/promise'
import { XyoApiConfig } from '@xyo-network/api-models'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleRepository, ModuleResolver } from '@xyo-network/module-model'
import { PayloadFields, SchemaFields } from '@xyo-network/payload-model'

import { HttpProxyModule } from '../HttpProxyModule'

export class RemoteModuleResolver implements ModuleRepository {
  private resolvedModules: Record<string, HttpProxyModule> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly apiConfig: XyoApiConfig) {}

  public get isModuleResolver(): boolean {
    return true
  }

  add(module: Module<SchemaFields & PayloadFields & { schema: string }>, name?: string | undefined): this
  add(module: Module<SchemaFields & PayloadFields & { schema: string }>[], name?: string[] | undefined): this
  add(
    module: Module<SchemaFields & PayloadFields & { schema: string }> | Module<SchemaFields & PayloadFields & { schema: string }>[],
    name?: string | string[] | undefined,
  ): this
  add(module: unknown, name?: unknown): this {
    throw new Error('Method not implemented.')
  }
  remove(name: string | string[]): this
  remove(address: string | string[]): this
  remove(address: unknown): this {
    throw new Error('Method not implemented.')
  }

  // TODO: Expose way for Node to add/remove modules

  resolve(filter?: ModuleFilter): Promise<Module[]> {
    return Promise.all(this.queryModules(filter))
  }

  async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    const settled = await Promise.allSettled(this.queryModules(filter))
    return settled.filter(fulfilled).map((r) => r.value)
  }

  private queryModules(filter?: ModuleFilter): Promise<Module>[] {
    const addresses = filter?.address
    const names = filter?.name
    // TODO: Handle filter?.config
    // TODO: Handle filter?.query
    // TODO: Should these be AND not OR filtering, can we do it in memory afterwards?
    const byAddress =
      addresses?.map((address) => {
        return this.resolveByAddress(address)
      }) || []
    const byName =
      names?.map((name) => {
        return this.resolveByName(name)
      }) || []
    return [...byAddress, ...byName]
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
}
