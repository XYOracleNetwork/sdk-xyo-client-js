import { assertEx } from '@xylabs/assert'
import { Module, ModuleFilter, ModuleParams } from '@xyo-network/module'

import { AbstractNode } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends Module = Module> extends AbstractNode<TConfig, TModule> {
  static configSchema = NodeConfigSchema
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: ModuleParams<NodeConfig>): Promise<MemoryNode> {
    return (await super.create(params)) as MemoryNode
  }

  override attach(address: string, name?: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.internalResolver.add(module, name)
  }

  override detach(address: string) {
    this.internalResolver.remove(address)
  }

  override register(module: TModule) {
    this.registeredModuleMap.set(module.address, module)
  }

  override registered() {
    return Array.from(this.registeredModuleMap.keys()).map((key) => {
      return key
    })
  }

  override registeredModules() {
    return Array.from(this.registeredModuleMap.values()).map((value) => {
      return value
    })
  }

  override async resolve(filter?: ModuleFilter): Promise<TModule[]> {
    return (await this.internalResolver.resolve(filter)) ?? (await this.resolver?.resolve(filter)) ?? []
  }

  override async tryResolve(filter?: ModuleFilter): Promise<TModule[]> {
    return (await this.internalResolver.tryResolve(filter)) ?? (await this.resolver?.tryResolve(filter)) ?? []
  }

  override unregister(module: TModule) {
    this.registeredModuleMap.delete(module.address)
  }
}
