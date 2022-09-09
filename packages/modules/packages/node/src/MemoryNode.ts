import { assertEx } from '@xylabs/assert'
import { XyoModule, XyoModuleConfig } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoNodeAttachQuerySchema, XyoNodeQuery } from './Queries'
import { XyoNode } from './XyoNode'

export class XyoMemoryNode<
  TConfig extends XyoModuleConfig = XyoModuleConfig,
  TQuery extends XyoNodeQuery = XyoNodeQuery,
  TQueryResult extends XyoPayload = XyoPayload,
  TModule extends XyoModule = XyoModule,
> extends XyoNode<TConfig, TQuery, TQueryResult, TModule> {
  private registeredModules = new Map<string, TModule>()
  private attachedModules = new Map<string, TModule>()

  public override queries(): TQuery['schema'][] {
    return [XyoNodeAttachQuerySchema]
  }

  override attached() {
    return Array.from(this.attachedModules.keys()).map(([key]) => {
      return key
    })
  }

  override available() {
    return Array.from(this.registeredModules.keys()).map(([key]) => {
      return key
    })
  }

  override register(module: TModule) {
    this.registeredModules.set(module.address, module)
  }

  override attach(address: string) {
    const module = assertEx(this.registeredModules.get(address), 'No module found at that address')
    this.attachedModules.set(address, module)
  }

  override detatch(address: string) {
    this.attachedModules.delete(address)
  }

  override get(address: string) {
    return this.attachedModules.get(address)
  }
}
