import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { AbstractModule, CompositeModuleResolver, duplicateModules, EventListener, Module, ModuleFilter, ModuleResolver } from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'
import { ModuleAttachedEventArgs, ModuleAttachedEventEmitter, ModuleResolverChangedEventArgs, ResolverChangedEventEmitter } from './Events'

type SupportedEventTypes = 'moduleAttached' | 'moduleResolverChanged'
type SupportedEventListeners<T extends SupportedEventTypes> = T extends 'moduleAttached'
  ? EventListener<ModuleAttachedEventArgs>
  : EventListener<ModuleResolverChangedEventArgs>

export type MemoryNodeParams<TConfig extends NodeConfig = NodeConfig> = AbstractNodeParams<TConfig>

export class MemoryNode<TConfig extends NodeConfig = NodeConfig>
  extends AbstractNode<TConfig>
  implements ModuleAttachedEventEmitter, ResolverChangedEventEmitter
{
  static configSchema = NodeConfigSchema
  private readonly moduleAttachedEventListeners: EventListener<ModuleAttachedEventArgs>[] = []
  private registeredModuleMap = new Map<string, Module>()
  private readonly resolverChangedEventListeners: EventListener<ModuleResolverChangedEventArgs>[] = []

  //Required to prevent field from being write only
  override get resolver() {
    return super.resolver
  }

  override set resolver(resolver: CompositeModuleResolver) {
    super.resolver = resolver
    const args = { resolver }
    this.resolverChangedEventListeners?.map((listener) => listener(args))
  }

  static override async create(params?: Partial<MemoryNodeParams>): Promise<MemoryNode> {
    const instance = (await super.create(params)) as MemoryNode

    //Arie: Why would we want to auto register modules?

    /*if (params?.autoAttachExternallyResolved) {
      const resolver = mixinResolverEventEmitter(instance.resolver)
      resolver.on('moduleResolved', (args) => {
        const { module, filter } = args
        try {
          instance.register(module)
          if (filter?.name?.length) {
            filter.name.map((name) => {
              instance.attach(module.address, name)
            })
          } else {
            instance.attach(module.address)
          }
        } catch (err) {
          params.logger?.error(`Error attaching externally resolved module: 0x${module.address}`)
        }
      })
      instance.resolver = resolver
    }*/
    return instance
  }

  override attach(address: string, name?: string, external?: boolean) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    if (external && this.resolver) {
      this.resolver.add(module, name)
    } else {
      this.internalResolver.add(module, name)
    }

    if (AbstractNode.isNode(module)) {
      this.internalResolver.addResolver((module as AbstractNode).resolver)
    }

    const args = { module, name }
    this.moduleAttachedEventListeners?.map((listener) => listener(args))
  }

  override detach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.internalResolver.removeResolver(module as unknown as ModuleResolver)
    this.internalResolver.remove(address)
  }

  on(event: 'moduleAttached', listener: (args: ModuleAttachedEventArgs) => void): this
  on(event: 'moduleResolverChanged', listener: (args: ModuleResolverChangedEventArgs) => void): this
  on<T extends SupportedEventTypes>(event: T, listener: SupportedEventListeners<T>): this {
    switch (event) {
      case 'moduleAttached':
        this.moduleAttachedEventListeners?.push(listener as EventListener<ModuleAttachedEventArgs>)
        break
      case 'moduleResolverChanged':
        this.resolverChangedEventListeners?.push(listener as EventListener<ModuleResolverChangedEventArgs>)
        break
    }
    return this
  }

  override register(module: AbstractModule, attach = false) {
    this.registeredModuleMap.set(module.address, module)
    module.resolver = this.internalResolver
    if (attach) {
      this.attach(module.address)
    }
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

  override async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const internal = this.internalResolver.resolve(filter)
    const external = this.resolver?.resolve(filter) || []
    const resolved = await Promise.allSettled([internal, external])
    return resolved
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(exists)
      .filter(duplicateModules)
  }

  override unregister(module: Module) {
    this.registeredModuleMap.delete(module.address)
  }
}
