import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { Logger } from '@xylabs/logger'
import { Base } from '@xylabs/object'
import { Promisable, PromiseEx } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { EventAnyListener, EventListener } from '@xyo-network/module-events'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  asModuleInstance,
  InstanceTypeCheck,
  isModule,
  isModuleInstance,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
  ModuleDescribeQuery,
  ModuleDescribeQuerySchema,
  ModuleDescriptionPayload,
  ModuleDescriptionSchema,
  ModuleDiscoverQuery,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleIdentifier,
  ModuleInstance,
  ModuleManifestQuery,
  ModuleManifestQuerySchema,
  ModuleQueryResult,
  ModuleResolverInstance,
  ModuleStateQuery,
  ModuleStateQuerySchema,
  ModuleStatus,
  ModuleTypeCheck,
} from '@xyo-network/module-model'
import { asPayload, ModuleError, ModuleErrorSchema, Payload, Query, WithMeta } from '@xyo-network/payload-model'

import type { ModuleWrapperParams } from './models'

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
    checkIdentity?: boolean,
  ): TModuleWrapper | undefined

  /** @deprecated pass an account for second parameter */
  wrap<TModuleWrapper extends ModuleWrapper>(this: ConstructableModuleWrapper<TModuleWrapper>, module: Module | undefined): TModuleWrapper
  wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account: AccountInstance,
    checkIdentity?: boolean,
  ): TModuleWrapper
}

export function constructableModuleWrapper<TWrapper extends ModuleWrapper>() {
  return <U extends ConstructableModuleWrapper<TWrapper>>(constructor: U) => {
    constructor
  }
}

@constructableModuleWrapper()
export class ModuleWrapper<TWrappedModule extends Module = Module>
  extends Base<Exclude<Omit<TWrappedModule['params'], 'config'> & { config: Exclude<TWrappedModule['params']['config'], undefined> }, undefined>>
  implements ModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  static instanceIdentityCheck: InstanceTypeCheck = isModuleInstance
  static moduleIdentityCheck: ModuleTypeCheck = isModule
  static requiredQueries: string[] = [ModuleDiscoverQuerySchema]

  eventData = {} as TWrappedModule['eventData']

  protected readonly wrapperParams: ModuleWrapperParams<TWrappedModule>

  private _status: ModuleStatus = 'wrapped'

  constructor(params: ModuleWrapperParams<TWrappedModule>) {
    const mutatedWrapperParams = { ...params } as ModuleWrapperParams<TWrappedModule>
    const mutatedParams = { ...params.module.params, config: { ...params.module.params.config } } as Exclude<
      Omit<TWrappedModule['params'], 'config'> & { config: Exclude<TWrappedModule['params']['config'], undefined> },
      undefined
    >

    //set the root params to the wrapped module params
    super(mutatedParams)
    this.wrapperParams = mutatedWrapperParams
  }

  get account() {
    return this.wrapperParams.account
  }

  get address() {
    return this.module.address
  }

  get config() {
    return this.module.config as Exclude<TWrappedModule['params']['config'], undefined>
  }

  get downResolver(): ModuleResolverInstance {
    //Should we be allowing this?
    const instance = asModuleInstance(this.module)
    if (instance) {
      return instance.downResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  get id() {
    return this.module.id
  }

  get module() {
    return this.wrapperParams.module
  }

  get queries(): string[] {
    return this.module.queries
  }

  get status() {
    return this._status
  }

  get upResolver(): ModuleResolverInstance {
    //Should we be allowing this?
    const instance = asModuleInstance(this.module)
    if (instance) {
      return instance.upResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  protected set status(value: ModuleStatus) {
    if (this._status !== 'dead') {
      this._status = value
    }
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
        return moduleQueries.includes(query) ? null : query
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
    checkIdentity?: boolean,
  ): TModuleWrapper | undefined
  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account?: AccountInstance,
    checkIdentity = true,
  ): TModuleWrapper | undefined {
    if (!checkIdentity || this.canWrap(module)) {
      if (!account) {
        this.defaultLogger?.info('Anonymous Module Wrapper Created')
      }
      return new this({ account: account ?? Account.randomSync(), module: module as TModuleWrapper['module'] })
    }
  }

  static with<TModuleWrapper extends ModuleWrapper, R extends Promisable<void> = void>(
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
    checkIdentity?: boolean,
  ): TModuleWrapper
  static wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    module: Module | undefined,
    account?: AccountInstance,
    checkIdentity = true,
  ): TModuleWrapper {
    assertEx(!checkIdentity || (module && this.moduleIdentityCheck(module)), () => `Passed module failed identity check: ${module?.config?.schema}`)
    return assertEx(this.tryWrap(module, account ?? Account.randomSync(), checkIdentity), () => 'Unable to wrap module as ModuleWrapper')
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return assertEx(
      (await this.sendQuery(queryPayload)).find((payload) => payload.schema === AddressPreviousHashSchema) as WithMeta<AddressPreviousHashPayload>,
      () => 'Result did not include correct payload',
    )
  }

  clearListeners(eventNames: Parameters<TWrappedModule['clearListeners']>[0]) {
    return this.module.clearListeners(eventNames)
  }

  async describe(): Promise<ModuleDescriptionPayload> {
    const queryPayload: ModuleDescribeQuery = { schema: ModuleDescribeQuerySchema }
    const response = (await this.sendQuery(queryPayload)).at(0)
    return assertEx(asPayload<ModuleDescriptionPayload>([ModuleDescriptionSchema])(response), () => `invalid describe payload [${response?.schema}]`)
  }

  async discover(): Promise<Payload[]> {
    const queryPayload: ModuleDiscoverQuery = { schema: ModuleDiscoverQuerySchema }
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

  async manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return (await this.sendQuery(queryPayload))[0] as WithMeta<ModuleManifestPayload>
  }

  async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return (await this.sendQuery(queryPayload)) as WithMeta<AddressPreviousHashPayload>[]
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
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as WithMeta<AddressPreviousHashPayload>).previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]) {
    return this.module.queryable(query, payloads)
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve<T extends ModuleInstance = ModuleInstance>(): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(filter: ModuleFilter<T> | undefined, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T> | undefined,
  ): Promise<ModuleInstance>
  /** @deprecated use '*' if trying to resolve all */
  async resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T> | undefined, options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    idOrFilter: ModuleIdentifier | ModuleFilter<T> = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const instance = asModuleInstance(this.module)
    if (instance?.['resolve']) {
      if (idOrFilter === '*') {
        return await instance.resolve<T>('*', options)
      }
      switch (typeof idOrFilter) {
        case 'string': {
          return await instance.resolve<T>(idOrFilter, options)
        }
        default: {
          return await instance.resolve<T>(idOrFilter, options)
        }
      }
    }
    return typeof idOrFilter === 'string' && idOrFilter !== '*' ? undefined : []
  }

  async state(): Promise<Payload[]> {
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    return await this.sendQuery(queryPayload)
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const promise = new PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance | undefined = this.account,
  ): Promise<[QueryBoundWitness, Payload[], ModuleError[]]> {
    const builder = await new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async filterErrors(result: ModuleQueryResult): Promise<ModuleError[]> {
    const wrapper = await BoundWitnessWrapper.wrap(result[0], result[1])
    return wrapper.payloadsBySchema<WithMeta<ModuleError>>(ModuleErrorSchema)
  }

  protected async sendQuery<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
  ): Promise<WithMeta<R>[]> {
    // Bind them
    const query = await this.bindQuery(queryPayload, payloads)

    // Send them off
    const queryResults = await this.module.query(query[0], query[1])
    const [, resultPayloads, errors] = queryResults

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (errors && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as WithMeta<R>[]
  }
}
