import { assertEx } from '@xylabs/assert'
import { XyoArchivistGetQuerySchema } from '@xyo-network/archivist'
import { Module, XyoModuleParams } from '@xyo-network/module'

import { NodeConfig } from './Config'
import { XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema } from './Queries'
import { XyoNode } from './XyoNode'

export class MemoryNode<TConfig extends NodeConfig = NodeConfig, TModule extends Module = Module> extends XyoNode<TConfig, TModule> {
  private attachedModuleMap = new Map<string, TModule>()
  private registeredModuleMap = new Map<string, TModule>()

  static override async create(params?: XyoModuleParams<NodeConfig>): Promise<MemoryNode> {
    return (await super.create(params)) as MemoryNode
  }

  override attach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.attachedModuleMap.set(address, module)
  }

  override attached() {
    return Array.from(this.attachedModuleMap.keys()).map((key) => {
      return key
    })
  }

  override attachedModules() {
    return Array.from(this.attachedModuleMap.values()).map((value) => {
      return value
    })
  }

  override detach(address: string) {
    this.attachedModuleMap.delete(address)
  }

  override find(schema: string[]): (TModule | null)[] {
    return schema.map((schema) => {
      this.logger?.log(`Finding in MemoryNode: ${schema}`)
      if (schema === 'network.xyo.archivist') {
        this.logger?.log(`attachedModules: ${JSON.stringify(this.attachedModules(), null, 2)}`)
        return this.attachedModules().find((module) => module.queryable(XyoArchivistGetQuerySchema)) ?? null
      }
      return this.attachedModules().find((module) => module.queryable(XyoArchivistGetQuerySchema)) ?? null
    })
  }

  public override queries(): string[] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetachQuerySchema, ...super.queries()]
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

  override resolve(addresses: string[]): (TModule | null)[] {
    return addresses.map((address) => {
      this.logger?.log(`Resolving in MemoryNode: ${address}`)
      return this.attachedModuleMap?.get(address) ?? null
    })
  }
}
