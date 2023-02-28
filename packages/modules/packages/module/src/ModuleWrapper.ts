import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import {
  Module,
  ModuleDescription,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleQueryResult,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import compact from 'lodash/compact'

import { XyoError, XyoErrorSchema } from './Error'
import { duplicateModules } from './lib'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'

export interface WrapperError extends Error {
  errors: (XyoError | null)[]
  query: [XyoQueryBoundWitness, XyoPayloads]
  result: ModuleQueryResult | undefined
}

export type ModuleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>> = {
  new (module: TModule, account?: AccountInstance): TWrapper
}

function moduleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>>() {
  return <U extends ModuleConstructable<TModule, TWrapper>>(constructor: U) => {
    constructor
  }
}

@moduleConstructable()
export class ModuleWrapper<TWrappedModule extends Module = Module> implements Module {
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

  readonly module: TWrappedModule

  constructor(module: TWrappedModule, protected readonly account?: AccountInstance) {
    //unwrap it if already wrapped
    const wrapper = module as unknown as ModuleWrapper<TWrappedModule>
    if (wrapper.module) {
      this.module = wrapper.module
    } else {
      this.module = module
    }
  }

  get address() {
    return this.module.address
  }

  get config(): TWrappedModule['config'] {
    return this.module.config
  }

  get downResolver() {
    return this.module.downResolver
  }

  get queries(): string[] {
    return this.module.queries
  }

  get upResolver() {
    return this.module.upResolver
  }

  static hasRequiredQueries(module: Module) {
    return this.missingRequiredQueries(module).length === 0
  }

  static missingRequiredQueries(module: Module): string[] {
    const moduleQueries = module.queries
    return compact(
      this.requiredQueries.map((query) => {
        return moduleQueries.find((item) => item === query) ? null : query
      }),
    )
  }

  static tryWrap(module?: Module): ModuleWrapper | undefined {
    if (!module) return undefined
    const missingRequiredQueries = this.missingRequiredQueries(module)
    if (missingRequiredQueries.length > 0) {
      console.warn(`Missing queries: ${JSON.stringify(missingRequiredQueries, null, 2)}`)
    } else {
      return new ModuleWrapper(module as Module)
    }
  }

  static wrap(module: Module): ModuleWrapper {
    return assertEx(this.tryWrap(module), 'Unable to wrap module as ModuleWrapper')
  }

  async describe(): Promise<Promise<Promisable<ModuleDescription>>> {
    const description: ModuleDescription = {
      address: this.module.address,
      queries: this.module.queries,
    }
    if (this.config.name) {
      description.name = this.config.name
    }

    const discover = await this.discover()

    description.children = compact(
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address != this.module.address ? address : undefined
      }) ?? [],
    )

    return description
  }

  discover(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return this.sendQuery(queryPayload)
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
    return this.module.queryable(query, payloads)
  }

  async resolve(nameOrAddress: string): Promise<Module | undefined>
  async resolve(filter?: ModuleFilter): Promise<Module[]>
  async resolve(nameOrAddressOrFilter?: ModuleFilter | string): Promise<Module | Module[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        const byAddress = Account.isAddress(nameOrAddressOrFilter) ? (await this.resolve({ address: [nameOrAddressOrFilter] })).pop() : undefined
        return byAddress ?? (await this.resolve({ name: [nameOrAddressOrFilter] })).pop()
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return [...(await this.module.downResolver.resolve(filter)), ...(await this.module.upResolver.resolve(filter))].filter(duplicateModules)
      }
    }
  }

  /**
   * Resolves the supplied filter into wrapped modules
   * @example <caption>Example using ArchivistWrapper</caption>
   * const filter = { address: [address] }
   * const mods: ArchivistWrapper[] = await node.resolveWrapped(ArchivistWrapper, filter)
   * @param wrapper The ModuleWrapper class (ArchivistWrapper,
   * DivinerWrapper, etc.)
   * @param filter The ModuleFilter
   * @returns An array of ModuleWrapper instances corresponding to
   * the underlying modules matching the supplied filter
   */
  async resolveWrapped<T extends ModuleWrapper<Module> = ModuleWrapper<Module>>(
    wrapper: ModuleConstructable<Module, T>,
    filter?: ModuleFilter,
  ): Promise<T[]>
  async resolveWrapped<T extends ModuleWrapper<Module> = ModuleWrapper<Module>>(
    wrapper: ModuleConstructable<Module, T>,
    nameOrAddress: string,
  ): Promise<T | undefined>
  async resolveWrapped<T extends ModuleWrapper<Module> = ModuleWrapper<Module>>(
    wrapper: ModuleConstructable<Module, T>,
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<T[] | T | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        const nameOrAddress: string = nameOrAddressOrFilter
        const mod = await this.resolve(nameOrAddress)
        return mod ? new wrapper(mod) : undefined
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return (await this.resolve(filter)).map((mod) => new wrapper(mod))
      }
    }
  }

  protected bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account: AccountInstance | undefined = this.account,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], AccountInstance> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], AccountInstance>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account: AccountInstance | undefined = this.account,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = (account ? builder.witness(account) : builder).build()
    return result
  }

  protected filterErrors(query: [XyoQueryBoundWitness, XyoPayloads], result: ModuleQueryResult | undefined): (XyoError | null)[] {
    return (result?.[1]?.filter((payload) => {
      if (payload?.schema === XyoErrorSchema) {
        const wrapper = new QueryBoundWitnessWrapper(query[0])
        return payload.sources?.includes(wrapper.hash)
      }
      return false
    }) ?? []) as XyoError[]
  }

  protected async sendQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(queryPayload: T, payloads?: XyoPayloads): Promise<XyoPayload[]> {
    //make sure we did not get wrapped payloads
    const unwrappedPayloads = payloads?.map((payload) => assertEx(PayloadWrapper.unwrap(payload), 'Unable to parse payload'))
    const unwrappedQueryPayload = assertEx(BoundWitnessWrapper.unwrap<XyoQueryBoundWitness>(queryPayload), 'Unable to parse queryPayload')

    // Bind them
    const query = await this.bindQuery(unwrappedQueryPayload, unwrappedPayloads)

    // Send them off
    const result = await this.module.query(query[0], query[1])

    this.throwErrors(query, result)
    return result[1]
  }

  protected throwErrors(query: [XyoQueryBoundWitness, XyoPayloads], result: ModuleQueryResult | undefined) {
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
