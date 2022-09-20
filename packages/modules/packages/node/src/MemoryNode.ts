import { assertEx } from '@xylabs/assert'
import { XyoArchivistGetQuerySchema } from '@xyo-network/archivist'
import { XyoModule } from '@xyo-network/module'

import { NodeConfig } from './Config'
import { XyoNodeAttachQuerySchema, XyoNodeDetatchQuerySchema, XyoNodeQuery } from './Queries'
import { XyoNode } from './XyoNode'

export class MemoryNode<
  TConfig extends NodeConfig = NodeConfig,
  TQuery extends XyoNodeQuery = XyoNodeQuery,
  TModule extends XyoModule = XyoModule,
> extends XyoNode<TConfig, TQuery, TModule> {
  private registeredModuleMap = new Map<string, TModule>()
  private attachedModuleMap = new Map<string, TModule>()

  public override queries(): TQuery['schema'][] {
    return [XyoNodeAttachQuerySchema, XyoNodeDetatchQuerySchema, ...super.queries()]
  }

  override attached() {
    return Array.from(this.attachedModuleMap.keys()).map((key) => {
      return key
    })
  }

  override registered() {
    return Array.from(this.registeredModuleMap.keys()).map((key) => {
      return key
    })
  }

  override attachedModules() {
    return Array.from(this.attachedModuleMap.values()).map((value) => {
      return value
    })
  }

  override registeredModules() {
    return Array.from(this.registeredModuleMap.values()).map((value) => {
      return value
    })
  }

  override resolve(address: string) {
    console.log(`Resolving in MemoryNode: ${address}`)
    if (address === 'archivist') {
      console.log(`attachedModules: ${JSON.stringify(this.attachedModules(), null, 2)}`)
      return this.attachedModules().find((module) => module.queryable(XyoArchivistGetQuerySchema)) ?? null
    }
    return this.attachedModuleMap?.get(address) ?? null
  }

  override register(module: TModule) {
    this.registeredModuleMap.set(module.address, module)
  }

  override attach(address: string) {
    const module = assertEx(this.registeredModuleMap.get(address), 'No module found at that address')
    this.attachedModuleMap.set(address, module)
  }

  override detatch(address: string) {
    this.attachedModuleMap.delete(address)
  }
}
