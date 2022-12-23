import { XyoApiConfig } from '@xyo-network/api-models'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'

export class RemoteModuleResolver implements ModuleResolver {
  // TODO: Allow optional ctor param for supplying address for nested Nodes
  // protected readonly address?: string,
  constructor(protected readonly apiConfig: XyoApiConfig) {}

  public get isModuleResolver(): boolean {
    return true
  }

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
    // TODO: Return subset of resolved modules
    try {
      return this.resolve(filter)
    } catch {
      return Promise.resolve([] as Module[])
    }
  }
}
