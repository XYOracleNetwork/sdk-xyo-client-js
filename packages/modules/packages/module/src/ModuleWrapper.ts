import { Account } from '@xyo-network/account'
import {
  AbstractModuleDiscoverQuery,
  AbstractModuleDiscoverQuerySchema,
  Module,
  ModuleDescription,
  ModuleQueryResult,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'

import { XyoError, XyoErrorSchema } from './Error'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'

export interface WrapperError extends Error {
  errors: (XyoError | null)[]
  query: [XyoQueryBoundWitness, XyoPayloads]
  result: ModuleQueryResult
}

export type ModuleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>> = {
  new (module: TModule, account?: Account): TWrapper
}

function moduleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>>() {
  return <U extends ModuleConstructable<TModule, TWrapper>>(constructor: U) => {
    constructor
  }
}

@moduleConstructable()
export class ModuleWrapper<TModule extends Module = Module> implements Module {
  static requiredQueries: string[] = [AbstractModuleDiscoverQuerySchema]

  protected readonly module: TModule

  constructor(module: TModule, protected readonly account?: Account) {
    //unwrap it if already wrapped
    const wrapper = module as unknown as ModuleWrapper<TModule>
    if (wrapper.module) {
      this.module = wrapper.module
    } else {
      this.module = module
    }
  }

  get address() {
    return this.module.address
  }
  get config(): XyoPayload {
    return this.module.config
  }

  static hasRequiredQueries(module: Module) {
    const moduleQueries = module.queries()
    return this.requiredQueries.reduce((prev, query) => {
      return prev && !!moduleQueries.find((item) => item === query)
    }, true)
  }

  static tryWrap(_module: Module): ModuleWrapper | undefined {
    throw new Error('Method not implemented.')
  }

  static wrap(_module: Module): ModuleWrapper {
    throw new Error('Method not implemented.')
  }

  public description(): Promisable<ModuleDescription> {
    return this.module.description()
  }

  discover(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<AbstractModuleDiscoverQuery>({ schema: AbstractModuleDiscoverQuerySchema })
    return this.sendQuery(queryPayload)
  }

  queries(): string[] {
    return this.module.queries()
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
    return this.module.queryable(query, payloads)
  }

  protected bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account: Account | undefined = this.account,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], Account> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], Account>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account: Account | undefined = this.account,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = (account ? builder.witness(account) : builder).build()
    return result
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

  protected async sendQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(queryPayload: T, payloads?: XyoPayloads): Promise<XyoPayload[]> {
    const query = await this.bindQuery(queryPayload, payloads)
    const result = await this.module.query(query[0], query[1])
    this.throwErrors(query, result)
    return result[1]
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
