import { assertEx } from '@xylabs/assert'
import { Base } from '@xylabs/base'
import { CreatableName } from '@xylabs/creatable'
import { EventAnyListener, EventListener } from '@xylabs/events'
import { exists } from '@xylabs/exists'
import { Address } from '@xylabs/hex'
import { Logger } from '@xylabs/logger'
import { Promisable, PromiseEx } from '@xylabs/promise'
import { isDefined } from '@xylabs/typeof'
import { AccountInstance } from '@xyo-network/account-model'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  AddressToWeakInstanceCache,
  asAttachableModuleInstance,
  asModuleInstance,
  AttachableModuleInstance,
  Direction,
  duplicateModules,
  InstanceTypeCheck,
  isModule,
  isModuleInstance,
  Module,
  ModuleAddressQuery,
  ModuleAddressQuerySchema,
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
import {
  ModuleError, ModuleErrorSchema, Payload, Query,
} from '@xyo-network/payload-model'
import { LRUCache } from 'lru-cache'

import type { ModuleWrapperParams } from './models.ts'

export type ConstructableModuleWrapper<TWrapper extends ModuleWrapper> = {
  defaultLogger?: Logger
  instanceIdentityCheck: InstanceTypeCheck
  moduleIdentityCheck: ModuleTypeCheck
  requiredQueries: string[]
  new (params: ModuleWrapperParams<TWrapper['mod']>): TWrapper

  canWrap(mod: Module | undefined): boolean

  is<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper?: any,
  ): wrapper is TModuleWrapper

  tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    mod: Module | undefined,
    account: AccountInstance,
    checkIdentity?: boolean,
  ): TModuleWrapper | undefined

  wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    mod: Module | undefined,
    account: AccountInstance,
    checkIdentity?: boolean,
  ): TModuleWrapper
}

export function constructableModuleWrapper<TWrapper extends ModuleWrapper>() {
  return <U extends ConstructableModuleWrapper<TWrapper>>(constructor: U) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    constructor
  }
}

@constructableModuleWrapper()
export class ModuleWrapper<TWrappedModule extends Module = Module>
  extends Base<Exclude<Omit<TWrappedModule['params'], 'config'> & { config: Exclude<TWrappedModule['params']['config'], undefined> }, undefined>>
  implements AttachableModuleInstance<TWrappedModule['params'], TWrappedModule['eventData']> {
  static readonly instanceIdentityCheck: InstanceTypeCheck = isModuleInstance
  static readonly moduleIdentityCheck: ModuleTypeCheck = isModule
  static readonly requiredQueries: string[] = [ModuleStateQuerySchema]

  eventData = {} as TWrappedModule['eventData']

  protected readonly cachedCalls = new LRUCache<string, Payload[]>({
    max: 1000, ttl: 1000 * 60, ttlAutopurge: true,
  })

  protected readonly wrapperParams: ModuleWrapperParams<TWrappedModule>

  private _parents: ModuleInstance[] = []
  private _status: ModuleStatus = 'wrapped'

  constructor(params: ModuleWrapperParams<TWrappedModule>) {
    const mutatedWrapperParams = { ...params } as ModuleWrapperParams<TWrappedModule>
    const mutatedParams = { ...params.mod.params, config: { ...params.mod.params.config } } as Exclude<
      Omit<TWrappedModule['params'], 'config'> & { config: Exclude<TWrappedModule['params']['config'], undefined> },
      undefined
    >

    // set the root params to the wrapped mod params
    super(mutatedParams)

    this.wrapperParams = mutatedWrapperParams
  }

  pipeline?: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many' | undefined
  addressCache?: ((direction: Direction, includePrivate: boolean) => AddressToWeakInstanceCache | undefined) | undefined

  get account() {
    return this.wrapperParams.account
  }

  get additionalSigners() {
    return this.wrapperParams.additionalSigners ?? []
  }

  get address() {
    return this.mod.address
  }

  get config() {
    return this.mod.config as Exclude<TWrappedModule['params']['config'], undefined>
  }

  get downResolver(): ModuleResolverInstance {
    // Should we be allowing this?
    const instance: AttachableModuleInstance | undefined = asAttachableModuleInstance(this.mod)
    if (instance) {
      return instance.downResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  get id() {
    return this.mod.id
  }

  get mod() {
    return this.wrapperParams.mod
  }

  get modName() {
    return this.mod.modName
  }

  get name() {
    return 'ModuleWrapper' as CreatableName
  }

  get priority() {
    return ObjectResolverPriority.Low
  }

  get privateResolver(): ModuleResolverInstance {
    // Should we be allowing this?
    const instance = asAttachableModuleInstance(this.mod)
    if (instance) {
      return instance.privateResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  get queries(): string[] {
    return this.mod.queries
  }

  get status() {
    return this._status
  }

  get upResolver(): ModuleResolverInstance {
    // Should we be allowing this?
    const instance = asAttachableModuleInstance(this.mod)
    if (instance) {
      return instance.upResolver as ModuleResolverInstance
    }
    throw new Error('Unsupported')
  }

  protected set status(value: ModuleStatus) {
    this._status = value
  }

  static canWrap(mod?: Module) {
    return !!mod && this.moduleIdentityCheck(mod)
  }

  static hasRequiredQueries(mod: Module) {
    return this.missingRequiredQueries(mod).length === 0
  }

  static is<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper: any,
  ): wrapper is TModuleWrapper {
    return wrapper instanceof this
  }

  static missingRequiredQueries(mod: Module): string[] {
    const modQueries = mod.queries
    return (
      this.requiredQueries.map((query) => {
        return modQueries.includes(query) ? null : query
      })
    ).filter(exists)
  }

  static tryWrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    mod: Module | undefined,
    account: AccountInstance,
    checkIdentity = true,
  ): TModuleWrapper | undefined {
    if (!checkIdentity || this.canWrap(mod)) {
      return new this({ account, mod: mod as TModuleWrapper['mod'] })
    }
  }

  static with<TModuleWrapper extends ModuleWrapper, R extends Promisable<void> = void>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mod: any,

    closure: (mod: TModuleWrapper) => R,
  ): R | undefined {
    return this.is(mod) ? closure(mod) : undefined
  }

  static wrap<TModuleWrapper extends ModuleWrapper>(
    this: ConstructableModuleWrapper<TModuleWrapper>,
    mod: Module | undefined,
    account: AccountInstance,
    checkIdentity = true,
  ): TModuleWrapper {
    assertEx(!checkIdentity || (mod && this.moduleIdentityCheck(mod)), () => `Passed mod failed identity check: ${mod?.config?.schema}`)
    return assertEx(this.tryWrap(mod, account, checkIdentity), () => 'Unable to wrap mod as ModuleWrapper')
  }

  addParent(mod: ModuleInstance) {
    const existingEntry = this._parents.find(parent => parent.address === mod.address)
    if (!existingEntry) {
      this._parents.push(mod)
    }
  }

  async addressPreviousHash(): Promise<AddressPreviousHashPayload> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return assertEx(
      (await this.sendQuery(queryPayload)).find(payload => payload.schema === AddressPreviousHashSchema) as AddressPreviousHashPayload,
      () => 'Result did not include correct payload',
    )
  }

  clearListeners(eventNames: Parameters<TWrappedModule['clearListeners']>[0]) {
    return this.mod.clearListeners(eventNames)
  }

  emit(eventName: Parameters<TWrappedModule['emit']>[0], eventArgs: Parameters<TWrappedModule['emit']>[1]) {
    return this.mod.emit(eventName, eventArgs)
  }

  emitSerial(eventName: Parameters<TWrappedModule['emitSerial']>[0], eventArgs: Parameters<TWrappedModule['emitSerial']>[1]) {
    return this.mod.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: Parameters<TWrappedModule['listenerCount']>[0]) {
    return this.mod.listenerCount(eventNames)
  }

  async manifest(maxDepth?: number): Promise<ModuleManifestPayload> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return (await this.sendQuery(queryPayload))[0] as ModuleManifestPayload
  }

  async manifestQuery(account: AccountInstance, maxDepth?: number): Promise<ModuleQueryResult<ModuleManifestPayload>> {
    const queryPayload: ModuleManifestQuery = { schema: ModuleManifestQuerySchema, ...(maxDepth === undefined ? {} : { maxDepth }) }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async moduleAddress(): Promise<AddressPreviousHashPayload[]> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return (await this.sendQuery(queryPayload)) as AddressPreviousHashPayload[]
  }

  off<TEventName extends keyof TWrappedModule['eventData']>(
    eventNames: TEventName,
    listener: EventListener<TWrappedModule['eventData'][TEventName]>,
  ) {
    return this.mod.off(eventNames, listener)
  }

  offAny(listener: EventAnyListener) {
    return this.mod.offAny(listener)
  }

  on<TEventName extends keyof TWrappedModule['eventData']>(eventNames: TEventName, listener: EventListener<TWrappedModule['eventData'][TEventName]>) {
    return this.mod.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener) {
    return this.mod.onAny(listener)
  }

  once<TEventName extends keyof TWrappedModule['eventData']>(
    eventName: TEventName,
    listener: EventListener<TWrappedModule['eventData'][TEventName]>,
  ) {
    return this.mod.once(eventName, listener)
  }

  parents(): Promisable<ModuleInstance[]> {
    return this._parents
  }

  async previousHash(): Promise<string | undefined> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return ((await this.sendQuery(queryPayload)).pop() as AddressPreviousHashPayload).previousHash
  }

  async previousHashQuery(account?: AccountInstance): Promise<ModuleQueryResult<AddressPreviousHashPayload>> {
    const queryPayload: ModuleAddressQuery = { schema: ModuleAddressQuerySchema }
    return await this.sendQueryRaw(queryPayload, undefined, account)
  }

  async privateChildren(): Promise<ModuleInstance[]> {
    if (isModuleInstance(this.mod)) {
      return await this.mod.privateChildren()
    }
    return []
  }

  async publicChildren(): Promise<ModuleInstance[]> {
    if (isModuleInstance(this.mod)) {
      return await this.mod.publicChildren()
    }
    return []
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]): Promise<ModuleQueryResult> {
    return await this.mod.query(query, payloads)
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness>(query: T, payloads?: Payload[]) {
    return this.mod.queryable(query, payloads)
  }

  removeParent(address: Address) {
    this._parents = this._parents.filter(item => item.address !== address)
  }

  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  async resolve<T extends ModuleInstance = ModuleInstance>(): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(all: '*', options?: ModuleFilterOptions<T>): Promise<T[]>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier,
    options?: ModuleFilterOptions<T> | undefined,
  ): Promise<ModuleInstance>
  async resolve<T extends ModuleInstance = ModuleInstance>(
    id: ModuleIdentifier = '*',
    options?: ModuleFilterOptions<T>,
  ): Promise<T | T[] | undefined> {
    const instance = asModuleInstance(this.mod)
    if (instance?.['resolve']) {
      if (id === '*') {
        return await instance.resolve<T>('*', options)
      }
      switch (typeof id) {
        case 'string': {
          return await instance.resolve<T>(id, options)
        }
        default: {
          return
        }
      }
    }
    return typeof id === 'string' && id !== '*' ? undefined : []
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
    return (await Promise.all((await this.parents()).map(parent => parent.publicChildren()))).flat().filter(duplicateModules)
  }

  start(): Promise<boolean> {
    throw new Error('Cannot start a wrapped module')
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

  stop(): Promise<boolean> {
    throw new Error('Cannot stop a wrapped module')
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account = this.account,
    additionalSigners = this.additionalSigners,
  ): PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new PromiseEx<[QueryBoundWitness, Payload[], ModuleError[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account, additionalSigners)
      resolve?.(result)
      return result
    }, account)
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account = this.account,
    additionalSigners = this.additionalSigners,
  ): Promise<[QueryBoundWitness, Payload[], ModuleError[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).query(query)
    const accounts = [account, ...additionalSigners].filter(exists)
    return await (accounts.length > 0 ? builder.signers(accounts) : builder).build()
  }

  protected filterErrors([bw, payloads]: ModuleQueryResult): ModuleError[] {
    const wrapper = BoundWitnessWrapper.wrap(bw, payloads)
    return wrapper.payloadsBySchema<ModuleError>(ModuleErrorSchema)
  }

  protected async sendQuery<T extends Query, P extends Payload = Payload, R extends Payload = Payload>(
    queryPayload: T,
    payloads?: P[],
  ): Promise<R[]> {
    const queryResults = await this.sendQueryRaw(queryPayload, payloads)
    const [, resultPayloads, errors] = queryResults

    /* TODO: Figure out what to do with the returning BW.  Should we store them in a queue in case the caller wants to see them? */

    if (isDefined(errors) && errors.length > 0) {
      /* TODO: Figure out how to rollup multiple Errors */
      throw errors[0]
    }

    return resultPayloads as R[]
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
