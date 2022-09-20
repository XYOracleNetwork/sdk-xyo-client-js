import { Promisable } from '@xyo-network/promise'

import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'

export class XyoModuleWrapper<TQuery extends XyoQuery = XyoQuery, TModule extends Module<TQuery> = Module<TQuery>> implements Module<TQuery> {
  public module: TModule

  constructor(module: TModule) {
    this.module = module
  }

  get address() {
    return this.module.address
  }

  queries(): TQuery['schema'][] {
    return this.module.queries()
  }

  queryable(schema: string) {
    return this.module.queryable(schema)
  }

  query(query: TQuery): Promisable<XyoModuleQueryResult> {
    return this.module.query(query)
  }
}
