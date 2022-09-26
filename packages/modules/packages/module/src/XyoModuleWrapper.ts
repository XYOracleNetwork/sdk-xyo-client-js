import { XyoAccount } from '@xyo-network/account'
import { XyoPayloads } from '@xyo-network/payload'

import { XyoModuleConfig } from './Config'
import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoQueryBoundWitness } from './Query'
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

  override query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayloads): Promise<ModuleQueryResult> {
    return this.module.query(query, payloads)
  }
}
