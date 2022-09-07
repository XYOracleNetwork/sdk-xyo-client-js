import { assertEx } from '@xylabs/assert'
import { XyoModule, XyoModuleQueryResult, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoNode } from './XyoNode'

export class XyoSimpleNode<TModule extends XyoModule = XyoModule> extends XyoNode<TModule> {
  private registeredModules = new Map<string, TModule>()
  private attachedModules = new Map<string, TModule>()

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

  query(query: XyoQuery): XyoModuleQueryResult {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (XyoPayload | null)[] = []
    return [this.bindPayloads(payloads), payloads]
  }
}
