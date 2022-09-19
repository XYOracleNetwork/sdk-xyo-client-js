import { assertEx } from '@xylabs/assert'
import { XyoArchivistGetQuerySchema } from '@xyo-network/archivist'
import { XyoModule, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoNodeAttachQuerySchema, XyoNodeDetatchQuerySchema, XyoNodeQuery } from './Queries'
import { XyoNode } from './XyoNode'

export class MemoryNode<
  TConfig extends XyoModuleConfig = XyoModuleConfig,
  TQuery extends XyoNodeQuery = XyoNodeQuery,
  TQueryResult extends XyoPayload = XyoPayload,
  TModule extends XyoModule = XyoModule,
> extends XyoNode<TConfig, TQuery, TQueryResult, TModule> {
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

  override availableModules() {
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

  override get(address: string) {
    return this.attachedModuleMap.get(address)
  }
}
