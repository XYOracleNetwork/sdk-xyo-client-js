import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import { XyoModuleDiscoverQuery, XyoModuleDiscoverQuerySchema } from './Queries'
import { QueryBoundWitnessWrapper, XyoError, XyoErrorSchema, XyoQueryBoundWitness } from './Query'
import { XyoModule } from './XyoModule'

export interface WrapperError extends Error {
  errors: (XyoError | null)[]
  query: [XyoQueryBoundWitness, XyoPayloads]
  result: ModuleQueryResult
}

export class ModuleWrapper<TModule extends Module = Module> extends XyoModule<Module['config']> {
  protected module: TModule

  constructor(module: TModule) {
    super({ config: module.config })
    this.module = module
  }

  override get address() {
    return this.module.address
  }

  override async discover(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<XyoModuleDiscoverQuery>({ schema: XyoModuleDiscoverQuerySchema })
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[1]
  }

  override queries(): string[] {
    return this.module.queries()
  }

  override async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
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

  protected async sendQuery(queryPayload: PayloadWrapper) {
    const query = await this.bindQuery(queryPayload)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result
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

/** @deprecated use ModuleWrapper instead */

export class XyoModuleWrapper<TModule extends Module = Module> extends ModuleWrapper<TModule> {}
