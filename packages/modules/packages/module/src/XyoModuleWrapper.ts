import { Promisable } from '@xyo-network/promise'

import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'

export class XyoModuleWrapper<TModule extends Module = Module> implements Module {
  public module: TModule

  constructor(module: TModule) {
    this.module = module
  }

  get address() {
    return this.module.address
  }

  queries(): string[] {
    return this.module.queries()
  }

  queryable(schema: string) {
    return this.module.queryable(schema)
  }

  query(query: XyoQuery): Promisable<XyoModuleQueryResult> {
    return this.module.query(query)
  }
}
