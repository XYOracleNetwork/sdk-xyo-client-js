import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { fulfilled } from '@xylabs/promise'
import {
  CompositeModuleResolver,
  duplicateModules,
  EventListener,
  mixinResolverEventEmitter,
  Module,
  ModuleFilter,
  ModuleResolver,
} from '@xyo-network/module'

import { AbstractNode, AbstractNodeParams } from './AbstractNode'
import { NodeConfig, NodeConfigSchema } from './Config'
import { ModuleAttachedEventArgs, ModuleAttachedEventEmitter, ModuleResolverChangedEventArgs, ResolverChangedEventEmitter } from './Events'
import { NodeModule } from './Node'

type SupportedEventTypes = 'moduleAttached' | 'moduleResolverChanged'
type SupportedEventListeners<T extends SupportedEventTypes> = T extends 'moduleAttached'
  ? EventListener<ModuleAttachedEventArgs>
  : EventListener<ModuleResolverChangedEventArgs>

export interface MemoryNodeParams<TConfig extends NodeConfig = NodeConfig> extends AbstractNodeParams<TConfig> {
  autoAttachExternallyResolved?: boolean
}

export class MemoryNode<TConfig extends NodeConfig = NodeConfig>
  extends AbstractNode<TConfig>
  implements ModuleAttachedEventEmitter, ResolverChangedEventEmitter
{
  static configSchema = NodeConfigSchema
  private readonly moduleAttachedEventListeners: EventListener<ModuleAttachedEventArgs>[] = []
  private registeredModuleMap = new Map<string, Module>()
  private readonly resolverChangedEventListeners: EventListener<ModuleResolverChangedEventArgs>[] = []

  override get resolver() {
    return super.resolver
  }

  override set resolver(resolver: CompositeModuleResolver | undefined) {
    super.resolver = resolver
    const args = { resolver }
    this.resolverChangedEventListeners?.map((listener) => listener(args))
  }

  static override async create(params?: Partial<MemoryNodeParams>): Promise<MemoryNode> {
    const instance = (await super.create(params)) as MemoryNode
    if (params?.resolver && params?.autoAttachExternallyResolved) {
      const resolver = mixinResolverEventEmitter(params?.resolver)
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
    }
    return instance
  }

  override attach(address: string, name?: string, external?: boolean) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    if (external && this.resolver) {
      this.resolver.add(module, name)
    } else {
      this.internalResolver.add(module, name)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodeModule = module as any
    // TODO: We need a better check than this to see if the module is a resolver
    if (nodeModule.resolve) {
      this.internalResolver.addResolver(nodeModule)
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

  override register(module: Module, attach = false) {
    this.registeredModuleMap.set(module.address, module)
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
    return (await this.tryResolve(filter)) ?? []
  }

  override async tryResolve(filter?: ModuleFilter): Promise<Module[]> {
    const internal = this.internalResolver.tryResolve(filter)
    const external = this.resolver?.tryResolve(filter) || []
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
