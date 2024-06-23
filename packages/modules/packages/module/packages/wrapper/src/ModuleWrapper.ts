import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
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
  asAttachableModuleInstance,
  asModuleInstance,
  AttachableModuleInstance,
  duplicateModules,
  InstanceTypeCheck,
  isModule,
  isModuleInstance,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
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
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { ModuleError, ModuleErrorSchema, Payload, Query, WithMeta } from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

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
  implements AttachableModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']>
{
  static instanceIdentityCheck: InstanceTypeCheck = isModuleInstance
  static moduleIdentityCheck: ModuleTypeCheck = isModule
  static requiredQueries: string[] = [ModuleStateQuerySchema]

  eventData = {} as TWrappedModule['eventData']

  protected readonly cachedCalls = new LRUCache<string, Payload[]>({ max: 1000, ttl: 1000 * 60, ttlAutopurge: true })

  protected readonly wrapperParams: ModuleWrapperParams<TWrappedModule>

  private _parents: ModuleInstance[] = []
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

  get additionalSigners() {
    return this.wrapperParams.additionalSigners ?? []
  }

  get address() {
    return this.module.address
  }

  get config() {
    return this.module.config as Exclude<TWrappedModule['params']['config'], undefined>
  }

  get downResolver(): ModuleResolverInstance {
    //Should we be allowing this?
    const instance: AttachableModuleInstance | undefined = asAttachableModuleInstance(this.module)
    if (instance) {
      return instance.downResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  get id() {
    return this.module.id
  }

  get modName() {
    return this.module.modName
  }

  get module() {
    return this.wrapperParams.module
  }

  get priority() {
    return ObjectResolverPriority.Low
  }

  get privateResolver(): ModuleResolverInstance {
    //Should we be allowing this?
    const instance = asAttachableModuleInstance(this.module)
    if (instance) {
      return instance.privateResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  get queries(): string[] {
    return this.module.queries
  }

  get status() {
    return this._status
  }

  get upResolver(): ModuleResolverInstance {
    //Should we be allowing this?
    const instance = asAttachableModuleInstance(this.module)
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

  addParent(module: ModuleInstance) {
    const existingEntry = this._parents.find((parent) => parent.address === module.address)
    if (!existingEntry) {
      this._parents.push(module)
    }
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

  async manifestQuery(account: AccountInstance, maxDepth?: number): Promise<ModuleQueryResult<ModuleManifestPayload>> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return await this.sendQueryRaw(queryPayload, undefined, account)
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

  parents(): Promisable<ModuleInstance[]> {
    return this._parents
  }

  async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as WithMeta<AddressPreviousHashPayload>).previousHash
  }

  async previousHashQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPreviousHashPayload>> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async privateChildren(): Promise<ModuleInstance[]> {
    if (isModuleInstance(this.module)) {
      return await this.module.privateChildren()
    }
    return []
  }

  async publicChildren(): Promise<ModuleInstance[]> {
    if (isModuleInstance(this.module)) {
      return await this.module.publicChildren()
    }
    return []
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.module.query(query, payloads)
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]) {
    return this.module.queryable(query, payloads)
  }

  removeParent(address: Address) {
    this._parents = this._parents.filter((item) => item.address !== address)
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

  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(id: ModuleIdentifier, options?: ModuleFilterOptions<T>): Promise<T | undefined>
  async resolvePrivate<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    _options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    if (id === '*') return await Promise.resolve([])
  }

  async siblings(): Promise<ModuleInstance[]> {
    return (await Promise.all((await this.parents()).map((parent) => parent.publicChildren()))).flat().filter(duplicateModules)
  }

  async state(): Promise<Payload[]> {
    const cachedResult = this.cachedCalls.get('state')
    if (cachedResult) {
      return cachedResult
    }
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    const result = await this.sendQuery(queryPayload)
    this.cachedCalls.set('state', result)
    return result
  }

  async stateQuery(_account: AccountInstance): Promise<ModuleQueryResult> {
    const queryPayload: ModuleStateQuery = { schema: ModuleStateQuerySchema }
    return await this.sendQueryRaw(queryPayload)
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account = this.account,
    additionalSigners = this.additionalSigners,
  ): PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const promise = new PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account, additionalSigners)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account = this.account,
    additionalSigners = this.additionalSigners,
  ): Promise<[QueryBoundWitness, Payload[], ModuleError[]]> {
    const builder = await new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const accounts = [account, ...additionalSigners].filter(exists)
    const result = await (account ? builder.signers(accounts) : builder).build()
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
    const queryResults = await this.sendQueryRaw(queryPayload, payloads)
    const [, resultPayloads, errors] = queryResults

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (errors && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as WithMeta<R>[]
  }

  protected async sendQueryRaw<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
    account?: AccountInstance,
  ): Promise<ModuleQueryResult<R>> {
    // Bind them
    const query = await this.bindQuery(queryPayload, payloads, account)

    // Send them off
    return (await this.query(query[0], query[1])) as ModuleQueryResult<R>
  }
}
