import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import { AbstractModule, duplicateModules, EventListener, Module, ModuleFilter } from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'
import {
  ModuleAttachedEventArgs,
  ModuleAttachedEventEmitter,
  ModuleDetachedEventArgs,
  ModuleResolverChangedEventArgs,
  ResolverChangedEventEmitter,
} from './Events'

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
  private readonly moduleDetachedEventListeners: EventListener<ModuleDetachedEventArgs>[] = []
  private registeredModuleMap = new Map<string, AbstractModule>()
  private readonly resolverChangedEventListeners: EventListener<ModuleResolverChangedEventArgs>[] = []

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

    //give it inside access
    module.parentResolver.addResolver(this.internalResolver)

    //give it outside access
    if (this.parentResolver) {
      module.parentResolver.addResolver(this.parentResolver)
    }

    if (external) {
      //expose it externally
      this.resolver.addResolver(module.resolver)
    }

    const args = { module, name }
    this.moduleAttachedEventListeners?.map((listener) => listener(args))
  }

  override detach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')

    //remove outside access
    module.parentResolver.removeResolver(this.parentResolver)

    //remove inside access
    module.parentResolver.removeResolver(this.internalResolver)

    //remove external exposure
    this.resolver.removeResolver(module.resolver)

    const args = { address }
    this.moduleDetachedEventListeners?.map((listener) => listener(args))
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

  override register(module: AbstractModule, attach = false, name?: string, external?: boolean) {
    this.registeredModuleMap.set(module.address, module)
    if (attach) {
      this.attach(module.address, name, external)
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

  override async resolve(filter?: ModuleFilter): Promise<AbstractModule[]> {
    const internal = this.internalResolver.resolve(filter)
    const external = this.parentResolver?.resolve(filter) || []
    const local = this.resolver?.resolve(filter) || []
    const resolved = await Promise.allSettled([internal, external, local])
    return resolved
      .filter(fulfilled)
      .map((r) => r.value)
      .flat()
      .filter(exists)
      .filter(duplicateModules)
  }

  override unregister(module: Module) {
    this.detach(module.address)
    this.registeredModuleMap.delete(module.address)
  }
}
