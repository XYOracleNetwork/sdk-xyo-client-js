import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitness, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { Base } from '@xyo-network/core'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { EventAnyListener, EventListener } from '@xyo-network/module-events'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  InstanceTypeCheck,
  isModule,
  isModuleInstance,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
  ModuleDescribeQuery,
  ModuleDescribeQuerySchema,
  ModuleDescription,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
  ModuleTypeCheck,
} from '@xyo-network/module-model'
import { ModuleError, ModuleErrorSchema, Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { PromiseEx } from '@xyo-network/promise'
import { Logger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { ModuleWrapperParams } from './models'
import { WrapperError } from './WrapperError'

export type ConstructableModuleWrapper<TWrapper extends ModuleWrapper> = {
  defaultLogger?: Logger
  instanceIdentityCheck: InstanceTypeCheck
  moduleIdentityCheck: ModuleTypeCheck
  requiredQueries: string[]
  new (params: ModuleWrapperParams<TWrapper['module']>): TWrapper

  canWrap(module: Module | undefined): boolean

  is<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper?: any,
  ): wrapper is TModuleWrapper

  /** @deprecated pass an account for second parameter */
  tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
  ): TModuleWrapper | undefined
  tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account: AccountInstance,
  ): TModuleWrapper | undefined

  /** @deprecated pass an account for second parameter */
  wrap<TModuleWrapper extends ModuleWrapper>(this: ConstructableModuleWrapper<TModuleWrapper>, module: Module | undefined): TModuleWrapper
  wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account: AccountInstance,
  ): TModuleWrapper
}

export function constructableModuleWrapper<TWrapper extends ModuleWrapper>() {
  return <U extends ConstructableModuleWrapper<TWrapper>>(constructor: U) => {
    constructor
  }
}

@constructableModuleWrapper()
export class ModuleWrapper<TWrappedModule extends Module = Module> extends Base<TWrappedModule['params']> {
  static instanceIdentityCheck: InstanceTypeCheck = isModuleInstance
  static moduleIdentityCheck: ModuleTypeCheck = isModule
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
    return !!module && this.moduleIdentityCheck(module)
  }

  static hasRequiredQueries(module: Module) {
    return this.missingRequiredQueries(module).length === 0
  }

  static is<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper: any,
  ): wrapper is TModuleWrapper {
    return wrapper instanceof this
  }

  static missingRequiredQueries(module: Module): string[] {
    const moduleQueries = module.queries
    return compact(
      this.requiredQueries.map((query) => {
        return moduleQueries.find((item) => item === query) ? null : query
      }),
    )
  }

  /** @deprecated pass an account for second parameter */
  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
  ): TModuleWrapper | undefined
  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account: AccountInstance,
  ): TModuleWrapper | undefined
  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account?: AccountInstance,
  ): TModuleWrapper | undefined {
    if (this.canWrap(module)) {
      if (!account) {
        this.defaultLogger?.info('Anonymous Module Wrapper Created')
      }
      return new this({ account: account ?? Account.randomSync(), module: module as TModuleWrapper['module'] })
    }
  }

  static with<TModuleWrapper extends ModuleWrapper, R extends void = void>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    module: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    closure: (module: TModuleWrapper) => R,
  ): R | undefined {
    return this.is(module) ? closure(module) : undefined
  }

  /** @deprecated pass an account for second parameter */
  static wrap<TModuleWrapper extends ModuleWrapper>(this: ConstructableModuleWrapper<TModuleWrapper>, module: Module | undefined): TModuleWrapper
  static wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account: AccountInstance,
  ): TModuleWrapper
  static wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account?: AccountInstance,
  ): TModuleWrapper {
    assertEx(!module || this.moduleIdentityCheck(module), 'Passed module failed identity check')
    return assertEx(this.tryWrap(module, account ?? Account.randomSync()), 'Unable to wrap module as ModuleWrapper')
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload = PayloadWrapper.wrap<ModuleAddressQuery>({ schema: ModuleAddressQuerySchema })
    return assertEx(
      (await this.sendQuery(queryPayload)).find((payload) => payload.schema === AddressPreviousHashSchema) as AddressPreviousHashPayload,
      'Result did not include correct payload',
    )
  }

  clearListeners(eventNames: Parameters<TWrappedModule['clearListeners']>[0]) {
    return this.module.clearListeners(eventNames)
  }

  //TODO: Make ModuleDescription into real payload
  async describe(): Promise<ModuleDescription> {
    const queryPayload = PayloadWrapper.wrap<ModuleDescribeQuery>({ schema: ModuleDescribeQuerySchema })
    return (await this.sendQuery(queryPayload))[0] as unknown as ModuleDescription
  }

  async discover(): Promise<Payload[]> {
    const queryPayload = PayloadWrapper.wrap<ModuleDiscoverQuery>({ schema: ModuleDiscoverQuerySchema })
    return await this.sendQuery(queryPayload)
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

  async manifest(): Promise<ModuleManifestPayload> {
    const queryPayload = PayloadWrapper.wrap<ModuleManifestQuery>({ schema: ModuleManifestQuerySchema })
    return (await this.sendQuery(queryPayload))[0] as ModuleManifestPayload
  }

  async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload = PayloadWrapper.wrap<ModuleAddressQuery>({ schema: ModuleAddressQuerySchema })
    return (await this.sendQuery(queryPayload)) as AddressPreviousHashPayload[]
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

  async previousHash(): Promise<string | undefined> {
    const queryPayload = PayloadWrapper.wrap<ModuleAddressQuery>({ schema: ModuleAddressQuerySchema })
    return ((await this.sendQuery(queryPayload)).pop() as AddressPreviousHashPayload).previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]) {
    return this.module.queryable(query, payloads)
  }

  async resolve<TModuleInstance extends ModuleInstance>(filter?: ModuleFilter, options?: ModuleFilterOptions<TModuleInstance>): Promise<Module[]>
  async resolve<TModuleInstance extends ModuleInstance>(
    nameOrAddress: string,
    options?: ModuleFilterOptions<TModuleInstance>,
  ): Promise<Module | undefined>
  async resolve<TModuleInstance extends ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions<TModuleInstance>,
  ): Promise<Module | Module[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return await this.module.resolve(nameOrAddressOrFilter, options)
      }
      default: {
        return await this.module.resolve(nameOrAddressOrFilter, options)
      }
    }
  }

  protected bindQuery<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance> {
    const promise = new PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance>(async (resolve) => {
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
  ): Promise<[QueryBoundWitness, Payload[], ModuleError[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async filterErrors(result: ModuleQueryResult): Promise<ModuleError[]> {
    const wrapper = BoundWitnessWrapper.wrap(result[0], result[1])
    return await wrapper.payloadsBySchema<ModuleError>(ModuleErrorSchema)
  }

  protected async sendQuery<T extends Query, W extends PayloadWrapper<T> = PayloadWrapper<T>>(
    queryPayload: T | W,
    payloads?: Payload[],
  ): Promise<Payload[]> {
    //make sure we did not get wrapped payloads
    const unwrappedPayloads: Payload[] = payloads?.map((payload) => assertEx(PayloadWrapper.unwrap(payload), 'Unable to parse payload')) ?? []
    const unwrappedQueryPayload: Query = assertEx(PayloadWrapper.unwrap<T, W>(queryPayload), 'Unable to parse queryPayload')

    // Bind them
    const query = await this.bindQuery(unwrappedQueryPayload, unwrappedPayloads)

    // Send them off
    const result = await this.module.query(query[0], query[1])

    /* TODO: Needs investigation. Problem is:
      a) the function does not work and
      b) it could be valid to return a payload with an error schema in a archivist get query
    */
    await this.throwErrors(query, result)
    return result[1]
  }

  protected async throwErrors(query: [QueryBoundWitness, Payload[], ModuleError[]], result?: ModuleQueryResult) {
    const logError = (error: ModuleError) => {
      console.log(`ModuleWrapper Error:  ${error.message} \n ${JSON.stringify(error, null, 2)}`)
    }

    const errors = result ? await this.filterErrors(result) : []
    if (errors?.length > 0) {
      errors.map((error) => logError(error))
      const error: WrapperError = {
        errors,
        message: errors.reduce((message, error) => `${message}${message.length > 0 ? '|' : ''}${error?.message}`, ''),
        name: 'Error',
        query,
        result,
      }
      throw error
    }
  }
}
