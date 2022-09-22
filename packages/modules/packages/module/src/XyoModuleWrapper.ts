import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness } from '@xyo-network/boundwitness'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'
import { XyoModule, XyoModuleResolverFunc } from './XyoModule'

export class XyoModuleWrapper<TModule extends Module = Module, TConfig extends XyoModuleConfig = XyoModuleConfig> extends XyoModule<TConfig> {
  public module: TModule

  constructor(module: TModule, config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    super(config, account, resolver)
    this.module = module
  }

  override get address() {
    return this.module.address
  }

  override queries(): string[] {
    return this.module.queries()
  }

  override queryable(schema: string, addresses?: string[]) {
    return this.module.queryable(schema, addresses)
  }

  override query<T extends XyoQuery = XyoQuery>(bw: XyoBoundWitness, query: T): Promise<XyoModuleQueryResult> {
    return this.module.query(bw, query)
  }
}
