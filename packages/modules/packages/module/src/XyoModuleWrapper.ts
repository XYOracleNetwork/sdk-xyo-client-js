import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoModuleConfig } from './Config'
import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import { QueryBoundWitnessWrapper, XyoError, XyoErrorSchema, XyoQueryBoundWitness } from './Query'
import { XyoModule, XyoModuleParams } from './XyoModule'

export interface WrapperError extends Error {
  errors: (XyoError | null)[]
  query: [XyoQueryBoundWitness, XyoPayloads]
  result: ModuleQueryResult
}

export interface XyoModuleWrapperParams<TModule extends Module = Module, TConfig extends XyoModuleConfig = XyoModuleConfig>
  extends XyoModuleParams<TConfig> {
  module: TModule
}
export class XyoModuleWrapper<TModule extends Module = Module, TConfig extends XyoModuleConfig = XyoModuleConfig> extends XyoModule<TConfig> {
  public module: TModule

  constructor(module: TModule) {
    super()
    this.module = module
  }

  override get address() {
    return this.module.address
  }

  override queries(): string[] {
    return this.module.queries()
  }

  override query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promisable<ModuleQueryResult> {
    return this.module.query(query, payloads)
  }

  override queryable(schema: string, addresses?: string[]) {
    return this.module.queryable(schema, addresses)
  }

  protected filterErrors(query: [XyoQueryBoundWitness, XyoPayloads], result: ModuleQueryResult): (XyoError | null)[] {
    return (result[1]?.filter((payload) => {
      if (payload?.schema === XyoErrorSchema) {
        const wrapper = new QueryBoundWitnessWrapper(query[0])
        return payload.sources?.includes(wrapper.hash)
      }
      return false
    }) ?? []) as XyoError[]
  }

  protected throwErrors(query: [XyoQueryBoundWitness, XyoPayloads], result: ModuleQueryResult) {
    const errors = this.filterErrors(query, result)
    if (errors?.length > 0) {
      const error: WrapperError = {
        errors,
        message: errors.reduce((message, error) => `${message}${message.length > 0 ? '|' : ''}${error?.message}`, ''),
        name: 'XyoError',
        query,
        result,
      }
      throw error
    }
  }
}
