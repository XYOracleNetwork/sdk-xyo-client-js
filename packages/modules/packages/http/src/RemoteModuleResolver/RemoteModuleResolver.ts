import { XyoApiConfig } from '@xyo-network/api-models'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

import { HttpProxyModule } from '../HttpProxyModule'

export class RemoteModuleResolver implements ModuleResolver {
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
    // TODO: These should be AND not OR filtering
    // TODO: Handle filter?.config
    // TODO: Handle filter?.query
    const byAddress =
      addresses?.map((address) => HttpProxyModule.create({ address, apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema } })) ||
      []
    const byName =
      names?.map((name) => HttpProxyModule.create({ apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema }, name })) || []
    const modules = await Promise.all([...byAddress, ...byName])
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
}
