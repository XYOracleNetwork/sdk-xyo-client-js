import { exists } from '@xylabs/exists'
import { XyoApiConfig } from '@xyo-network/api-models'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

import { HttpProxyModule } from '../HttpProxyModule'

export class RemoteModuleResolver implements ModuleResolver {
  private modules: Record<string, HttpProxyModule> = {}

  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly apiConfig: XyoApiConfig) {}

  public get isModuleResolver(): boolean {
    return true
  }

  // TODO: Expose way for Node to add/remove modules
  // TODO: Store successfully resolved modules

  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const addresses = filter?.address
    const names = filter?.name
    // TODO: Handle filter?.config
    // TODO: Handle filter?.query
    // TODO: Should these be AND not OR filtering, can we do it in memory afterwards?
    const byAddress = addresses?.map(this.resolveByAddress) || []
    const byName = names?.map(this.resolveByName) || []
    const modules = (await Promise.all([...byAddress, ...byName])).filter(exists)
    return modules
  }

  tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    // TODO: Return subset of resolved modules (Promise.allSettled)
    try {
      return this.resolve(filter)
    } catch {
      return Promise.resolve([] as Module[])
    }
  }

  private async resolveByAddress(address: string): Promise<HttpProxyModule> {
    const cached = this.modules[address]
    if (cached) return cached
    const mod = await HttpProxyModule.create({ address, apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema } })
    this.modules[address] = mod
    return mod
  }
  private async resolveByName(name: string): Promise<HttpProxyModule> {
    const cached = this.modules[name]
    if (cached) return cached
    const mod = await HttpProxyModule.create({ apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema }, name })
    this.modules[name] = mod
    this.modules[mod.address] = mod
    return mod
  }
}
