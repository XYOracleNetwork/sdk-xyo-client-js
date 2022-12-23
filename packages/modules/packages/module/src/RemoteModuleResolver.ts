import { XyoApiConfig } from '@xyo-network/api-models'
import { HttpProxyModule } from '@xyo-network/http-proxy-module'
import { AbstractModuleConfigSchema, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module-model'
import { PayloadFields, SchemaFields } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export class RemoteModuleResolver implements ModuleResolver {
  constructor(protected readonly apiConfig: XyoApiConfig, protected readonly address?: string) {}

  public get isModuleResolver(): boolean {
    return true
  }

  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const addresses = filter?.address
    const names = filter?.name
    // TODO: Handle filter?.config
    // TODO: Handle filter?.query
    // TODO: These should be AND not OR filtering
    const modsA =
      addresses?.map((address) => HttpProxyModule.create({ address, apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema } })) ||
      []
    const modsB =
      names?.map((name) => HttpProxyModule.create({ apiConfig: this.apiConfig, config: { schema: AbstractModuleConfigSchema }, name })) || []
    const modules = await Promise.all([...modsA, ...modsB])
    return modules
  }
  tryResolve(filter?: ModuleFilter): Promisable<Module<SchemaFields & PayloadFields & { schema: string }>[], never> {
    try {
      return this.resolve(filter)
    } catch {
      return []
    }
  }
}
