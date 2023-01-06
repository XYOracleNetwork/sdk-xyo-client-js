import { assertEx } from '@xylabs/assert'
import { fulfilled } from '@xylabs/promise'
import { duplicateModules, Module, ModuleFilter, ModuleResolver, ResolverEventEmitter } from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'

export interface MemoryNodeParams<TConfig extends NodeConfig = NodeConfig, TModule extends Module = Module>
  extends AbstractNodeParams<TConfig, TModule> {
  autoAttachExternallyResolved?: boolean
}

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends Module = Module> extends AbstractNode<TConfig, TModule> {
  static configSchema = NodeConfigSchema
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: Partial<MemoryNodeParams>): Promise<MemoryNode> {
    const instance = (await super.create(params)) as MemoryNode
    if (params?.resolver && params?.autoAttachExternallyResolved) {
      const resolver = new ResolverEventEmitter(params?.resolver)
      resolver.on('moduleResolved', (args) => {
        const { module, filter } = args
        instance.register(module)
        if (filter?.name?.length) {
          filter.name.map((name) => {
            instance.attach(module.address, name)
          })
        } else {
          instance.attach(module.address)
        }
      })
      instance.resolver = resolver
    }
    return instance
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
    return resolved.flat().filter(duplicateModules)
  }

  override async tryResolve(filter?: ModuleFilter): Promise<TModule[]> {
    const internal = this.internalResolver.tryResolve(filter)
    const external = (this.resolver as ModuleResolver<TModule> | undefined)?.tryResolve(filter) || []
    const resolved = await Promise.allSettled([internal, external])
    return resolved
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(duplicateModules)
  }

  override unregister(module: TModule) {
    this.registeredModuleMap.delete(module.address)
  }
}
