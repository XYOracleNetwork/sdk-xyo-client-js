import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'
import { XyoModule } from './XyoModule'

export class XyoModuleWrapper implements Module<XyoQuery, XyoPayload> {
  public module: XyoModule

  constructor(module: XyoModule) {
    this.module = module
  }

  get address() {
    return this.module.address
  }

  get queries() {
    return this.module.queries
  }

  queriable(schema: string) {
    return this.module.queriable(schema)
  }

  query(query: XyoQuery): Promisable<XyoModuleQueryResult<XyoPayload>> {
    return this.module.query(query)
  }
}
