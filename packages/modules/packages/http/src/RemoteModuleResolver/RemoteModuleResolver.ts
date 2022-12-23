import { XyoApiConfig } from '@xyo-network/api-models'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

import { HttpProxyModule } from '../HttpProxyModule'

const fulfilled = <T>(val: PromiseSettledResult<T>): val is PromiseFulfilledResult<T> => {
  return val.status === 'fulfilled'
}
export class RemoteModuleResolver implements ModuleResolver {
  private resolvedModules: Record<string, HttpProxyModule> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly apiConfig: XyoApiConfig) {}

  public get isModuleResolver(): boolean {
    return true
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
