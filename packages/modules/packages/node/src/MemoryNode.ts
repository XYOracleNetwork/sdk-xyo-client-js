import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Module, ModuleFilter, ModuleResolver, ModuleWrapper } from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends Module = Module> extends AbstractNode<TConfig, TModule> {
  static configSchema = NodeConfigSchema
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: Partial<AbstractNodeParams>): Promise<MemoryNode> {
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
    const internal = this.internalResolver.resolve(filter)
    const external = (this.resolver as ModuleResolver<TModule> | undefined)?.resolve(filter) || []
    const resolved = await Promise.all([internal, external])
    return resolved.flatMap((mod) => mod)
  }

  async resolveWrapped<T extends ModuleWrapper = ModuleWrapper>(wrapper: { new (mod: Module): T }, filter?: ModuleFilter): Promise<T[]> {
    return (await this.resolve(filter)).map((mod) => new wrapper(mod))
  }

  override async tryResolve(filter?: ModuleFilter): Promise<TModule[]> {
    const internal = this.internalResolver.tryResolve(filter)
    const external = (this.resolver as ModuleResolver<TModule> | undefined)?.tryResolve(filter) || []
    const resolved = await Promise.all([internal, external])
    return resolved.flatMap((mod) => mod)
  }

  async tryResolveWrapped<T extends ModuleWrapper = ModuleWrapper>(wrapper: { new (mod: Module): T }, filter?: ModuleFilter): Promise<T[]> {
    return (await this.tryResolve(filter))
      .map((mod) => {
        try {
          return new wrapper(mod)
        } catch (_err) {
          return undefined
        }
      })
      .filter(exists)
  }

  override unregister(module: TModule) {
    this.registeredModuleMap.delete(module.address)
  }
}
