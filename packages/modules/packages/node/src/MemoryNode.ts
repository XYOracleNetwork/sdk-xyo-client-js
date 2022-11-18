import { assertEx } from '@xylabs/assert'
import { ModuleFilter, XyoModule, XyoModuleParams, XyoModuleResolver } from '@xyo-network/module'

import { NodeConfig } from './Config'
import { XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema } from './Queries'
import { XyoNode } from './XyoNode'

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends XyoModule = XyoModule> extends XyoNode<TConfig, TModule> {
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: XyoModuleParams<NodeConfig>, internalResolver?: XyoModuleResolver): Promise<MemoryNode> {
    const instance = (await super.create(params)) as MemoryNode
    instance.internalResolver = internalResolver ?? new XyoModuleResolver()
    return instance
  }

  override attach(address: string, name?: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.internalResolver.add(module, name)
  }

  override detach(address: string) {
    this.internalResolver.remove(address)
  }

  public override queries(): string[] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, ...super.queries()]
  }

  override register(module: TModule) {
    module.resolver = this.internalResolver
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

  override unregister(module: TModule) {
    this.registeredModuleMap.delete(module.address)
  }
}
