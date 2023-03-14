import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { BaseParams } from '@xyo-network/core'
import {
  EventAnyListener,
  EventListener,
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

import { BaseEmitter } from './BaseEmitter'
import { XyoError, XyoErrorSchema } from './Error'
import { duplicateModules } from './lib'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'

export interface WrapperError extends Error {
  errors: (XyoError | null)[]
  query: [XyoQueryBoundWitness, XyoPayloads]
  result: ModuleQueryResult | undefined
}

export type ModuleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>> = {
  new (params: ModuleWrapperParams): TWrapper
}

export function moduleConstructable<TModule extends Module = Module, TWrapper extends ModuleWrapper<TModule> = ModuleWrapper<TModule>>() {
  return <U extends ModuleConstructable<TModule, TWrapper>>(constructor: U) => {
    constructor
  }
}

export type ModuleWrapperParams<TWrappedModule extends Module = Module> = BaseParams<{
  account?: AccountInstance
  module: TWrappedModule
}>

@moduleConstructable()
export class ModuleWrapper<TWrappedModule extends Module = Module>
  extends BaseEmitter<TWrappedModule['params']>
  implements Module<TWrappedModule['params']>
{
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

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

  static tryWrap(module?: Module, account?: AccountInstance): ModuleWrapper | undefined {
    if (this.canWrap(module)) {
      if (!account) {
        this.defaultLogger?.info('Anonymous Module Wrapper Created')
      }
      return new ModuleWrapper({ account, module: module as Module })
    }
  }

  static wrap(module?: Module, account?: AccountInstance): ModuleWrapper {
    return assertEx(this.tryWrap(module, account), 'Unable to wrap module as ModuleWrapper')
  }

  override clearListeners(eventNames: keyof TWrappedModule['params']['eventData'] | keyof TWrappedModule['params']['eventData'][]) {
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

  discover(): Promise<XyoPayload[]> {
    const queryPayload = PayloadWrapper.parse<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return this.sendQuery(queryPayload)
  }

  override emit(
    eventName: keyof TWrappedModule['params']['eventData'],
    eventArgs?: TWrappedModule['params']['eventData'][keyof TWrappedModule['params']['eventData']],
  ) {
    return this.module.emit(eventName, eventArgs)
  }

  override emitSerial(
    eventName: keyof TWrappedModule['params']['eventData'],
    eventArgs?: TWrappedModule['params']['eventData'][keyof TWrappedModule['params']['eventData']],
  ) {
    return this.module.emitSerial(eventName, eventArgs)
  }

  override listenerCount(eventNames: keyof TWrappedModule['params']['eventData'] | keyof TWrappedModule['params']['eventData'][]) {
    return this.module.listenerCount(eventNames)
  }

  override off(
    eventNames: keyof TWrappedModule['params']['eventData'] | keyof TWrappedModule['params']['eventData'][],
    listener: EventListener<TWrappedModule['params']['eventData']>,
  ) {
    return this.module.off(eventNames, listener)
  }

  override offAny(listener: EventAnyListener<TWrappedModule['params']['eventData']>) {
    return this.module.offAny(listener)
  }

  override on(
    eventNames: keyof TWrappedModule['params']['eventData'] | keyof TWrappedModule['params']['eventData'][],
    listener: EventListener<TWrappedModule['params']['eventData']>,
  ) {
    return this.module.on(eventNames, listener)
  }

  override onAny(listener: EventAnyListener<TWrappedModule['params']['eventData']>) {
    return this.module.onAny(listener)
  }

  override once(
    eventNames: keyof TWrappedModule['params']['eventData'] | keyof TWrappedModule['params']['eventData'][],
    listener: EventListener<TWrappedModule['params']['eventData']>,
  ) {
    return this.module.once(eventNames, listener)
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]) {
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
        const mod = await this.resolve<T['module']>(nameOrAddress)
        return mod ? new wrapper({ account: this.account, module: mod }) : undefined
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return (await this.resolve<T['module']>(filter)).map((mod) => new wrapper({ account: this.account, module: mod }))
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
