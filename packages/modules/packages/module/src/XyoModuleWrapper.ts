import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoModuleConfig } from './Config'
import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoQueryBoundWitness } from './Query'
import { XyoModule, XyoModuleParams } from './XyoModule'

export interface XyoModuleWrapperParams<TModule extends Module = Module, TConfig extends XyoModuleConfig = XyoModuleConfig>
  extends XyoModuleParams<TConfig> {
  module: TModule
}
export class XyoModuleWrapper<TModule extends Module = Module, TConfig extends XyoModuleConfig = XyoModuleConfig> extends XyoModule<TConfig> {
  public module: TModule

  constructor(params: XyoModuleWrapperParams<TModule, TConfig>) {
    super(params)
    this.module = params.module
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

  override query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promisable<ModuleQueryResult> {
    return this.module.query(query, payloads)
  }
}
