import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { Base } from '@xyo-network/core'
import { duplicateModules, ModuleError, ModuleErrorSchema, QueryBoundWitnessBuilder } from '@xyo-network/module-abstract'
import { EventAnyListener, EventListener } from '@xyo-network/module-events'
import {
  Module,
  ModuleAccountQuery,
  ModuleAccountQuerySchema,
  ModuleDescription,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleQueryResult,
  Query,
  QueryBoundWitness,
} from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { Logger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { ModuleWrapperParams } from './models'

export interface WrapperError extends Error {
  errors: (ModuleError | null)[]
  query: [QueryBoundWitness, Payload[]]
  result: ModuleQueryResult | undefined
}

export type ConstructableModuleWrapper<TWrapper extends ModuleWrapper> = {
  defaultLogger?: Logger
  requiredQueries: string[]
  new (params: ModuleWrapperParams<TWrapper['module']>): TWrapper
  canWrap(module?: Module): boolean
  tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module?: Module,
    account?: AccountInstance,
  ): TModuleWrapper | undefined
  wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module?: Module,
    account?: AccountInstance,
  ): TModuleWrapper
}

export function constructableModuleWrapper<TWrapper extends ModuleWrapper>() {
  return <U extends ConstructableModuleWrapper<TWrapper>>(constructor: U) => {
    constructor
  }
}

@constructableModuleWrapper()
export class ModuleWrapper<TWrappedModule extends Module = Module>
  extends Base<TWrappedModule['params']>
  implements Module<TWrappedModule['params'], TWrappedModule['eventData']>
{
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

  eventData = {} as TWrappedModule['eventData']

  protected readonly wrapperParams: ModuleWrapperParams<TWrappedModule>

  constructor(params: ModuleWrapperParams<TWrappedModule>) {
    const mutatedParams = { ...params } as ModuleWrapperParams<TWrappedModule>
    //unwrap it if already wrapped
    const wrapper = params.module as unknown as ModuleWrapper<TWrappedModule>
    if (wrapper.module) {
      mutatedParams.module = wrapper.module
    }

    //set the root params to the wrapped module params
    super(params.module.params)
    this.wrapperParams = params
  }

  get account() {
    return this.wrapperParams.account
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

  get module() {
    return this.wrapperParams.module
  }

  get queries(): string[] {
    return this.module.queries
  }

  get upResolver() {
    return this.module.upResolver
  }

  static canWrap(module?: Module) {
    return !!module && this.missingRequiredQueries(module).length === 0
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

  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module?: Module,
    account?: AccountInstance,
  ): TModuleWrapper | undefined {
    if (this.canWrap(module)) {
      if (!account) {
        this.defaultLogger?.info('Anonymous Module Wrapper Created')
      }
      return new this({ account, module: module as Module })
    }
  }

  static wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module?: Module,
    account?: AccountInstance,
  ): TModuleWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as ModuleWrapper')
  }

  clearListeners(eventNames: Parameters<TWrappedModule['clearListeners']>[0]) {
    return this.module.clearListeners(eventNames)
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

  discover(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return this.sendQuery(queryPayload)
  }

  emit(eventName: Parameters<TWrappedModule['emit']>[0], eventArgs: Parameters<TWrappedModule['emit']>[1]) {
    return this.module.emit(eventName, eventArgs)
  }

  emitSerial(eventName: Parameters<TWrappedModule['emitSerial']>[0], eventArgs: Parameters<TWrappedModule['emitSerial']>[1]) {
    return this.module.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: Parameters<TWrappedModule['listenerCount']>[0]) {
    return this.module.listenerCount(eventNames)
  }

  off<TEventName extends keyof TWrappedModule['eventData']>(
    eventNames: TEventName,
    listener: EventListener<TWrappedModule['eventData'][TEventName]>,
  ) {
    return this.module.off(eventNames, listener)
  }

  offAny(listener: EventAnyListener) {
    return this.module.offAny(listener)
  }

  on<TEventName extends keyof TWrappedModule['eventData']>(eventNames: TEventName, listener: EventListener<TWrappedModule['eventData'][TEventName]>) {
    return this.module.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener) {
    return this.module.onAny(listener)
  }

  once<TEventName extends keyof TWrappedModule['eventData']>(
    eventName: TEventName,
    listener: EventListener<TWrappedModule['eventData'][TEventName]>,
  ) {
    return this.module.once(eventName, listener)
  }

  previousHash(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleAccountQuery>({ schema: ModuleAccountQuerySchema })
    return this.sendQuery(queryPayload)
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]) {
    return this.module.queryable(query, payloads)
  }

  async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]>
  async resolve<TModule extends Module = Module>(nameOrAddress: string): Promise<TModule | undefined>
  async resolve<TModule extends Module = Module>(nameOrAddressOrFilter?: ModuleFilter | string): Promise<TModule | TModule[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        const byAddress = Account.isAddress(nameOrAddressOrFilter)
          ? (await this.resolve<TModule>({ address: [nameOrAddressOrFilter] })).pop()
          : undefined
        return byAddress ?? (await this.resolve<TModule>({ name: [nameOrAddressOrFilter] })).pop()
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return [...(await this.module.downResolver.resolve<TModule>(filter)), ...(await this.module.upResolver.resolve<TModule>(filter))].filter(
          duplicateModules,
        )
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
    wrapper: ConstructableModuleWrapper<T>,
    filter?: ModuleFilter,
  ): Promise<T[]>
  async resolveWrapped<T extends ModuleWrapper<Module> = ModuleWrapper<Module>>(
    wrapper: ConstructableModuleWrapper<T>,
    nameOrAddress: string,
  ): Promise<T | undefined>
  async resolveWrapped<T extends ModuleWrapper<Module> = ModuleWrapper<Module>>(
    wrapper: ConstructableModuleWrapper<T>,
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<T[] | T | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        const nameOrAddress: string = nameOrAddressOrFilter
        const mod = await this.resolve<T['module']>(nameOrAddress)
        return mod ? new wrapper({ account: this.account, module: mod }) : undefined
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return (await this.resolve<T['module']>(filter)).map((mod) => new wrapper({ account: this.account, module: mod }))
      }
    }
  }

  protected bindQuery<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): PromiseEx<[QueryBoundWitness, Payload[]], AccountInstance> {
    const promise = new PromiseEx<[QueryBoundWitness, Payload[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindQueryInternal<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): Promise<[QueryBoundWitness, Payload[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async filterErrors(result: ModuleQueryResult): Promise<ModuleError[]> {
    const wrapper = new BoundWitnessWrapper(result[0], result[1])
    return await wrapper.payloadsBySchema<ModuleError>(ModuleErrorSchema)
  }

  protected async sendQuery<T extends Query | PayloadWrapper<Query>>(queryPayload: T, payloads?: Payload[]): Promise<Payload[]> {
    //make sure we did not get wrapped payloads
    const unwrappedPayloads: Payload[] = payloads?.map((payload) => assertEx(PayloadWrapper.unwrap(payload), 'Unable to parse payload')) ?? []
    const unwrappedQueryPayload: Query = assertEx(PayloadWrapper.unwrap<T>(queryPayload), 'Unable to parse queryPayload')

    // Bind them
    const query = await this.bindQuery(unwrappedQueryPayload, unwrappedPayloads)

    // Send them off
    const result = await this.module.query(query[0], query[1])

    /* Removed this for now.  Problem is:
      a) the function does not work and
      b) it could be valid to return a payload with an error schema in a archivist get query
    */
    //await this.throwErrors(query, result)
    return result[1]
  }

  protected async throwErrors(query: [QueryBoundWitness, Payload[]], result?: ModuleQueryResult) {
    const errors = result ? await this.filterErrors(result) : []
    if (errors?.length > 0) {
      console.log(`Errors: ${JSON.stringify(errors, null, 2)}`)
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
