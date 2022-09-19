import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'

export class XyoModuleWrapper<
  TQuery extends XyoQuery = XyoQuery,
  TQueryResult extends XyoPayload = XyoPayload,
  TModule extends Module<TQuery, TQueryResult> = Module<TQuery, TQueryResult>,
> implements Module<TQuery, TQueryResult>
{
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

  query(query: TQuery): Promisable<XyoModuleQueryResult<TQueryResult>> {
    return this.module.query(query)
  }
}
