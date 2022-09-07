import { XyoModule, XyoModuleQueryResult, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

import { XyoNode } from './XyoNode'

export class XyoSimpleNode<TModule extends XyoModule = XyoModule> extends XyoNode<TModule> {
  private modules = new Map<string, TModule>()

  override list() {
    return Array.from(this.modules.keys()).map(([key]) => {
      return key
    })
  }

  override attach(module: TModule) {
    this.modules.set(module.address, module)
  }

  override remove(address: string) {
    this.modules.delete(address)
  }

  override get(address: string) {
    return this.modules.get(address)
  }

  query(query: XyoQuery): XyoModuleQueryResult {
    if (!this.queries.find((schema) => schema === query.schema)) {
      console.error(`Undeclared Module Query: ${query.schema}`)
    }

    const payloads: (XyoPayload | null)[] = []
    return [this.bindPayloads(payloads), payloads]
  }
}
