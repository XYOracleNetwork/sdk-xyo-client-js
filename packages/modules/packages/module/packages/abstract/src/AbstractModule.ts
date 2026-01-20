/* eslint-disable max-lines */
import type {
  Address, CreatableInstance, Hash, Logger,
  Promisable,
} from '@xylabs/sdk-js'
import {
  AbstractCreatable,
  assertEx,
  ConsoleLogger, exists,
  forget,
  globallyUnique,
  handleErrorAsync,
  IdLogger,
  isDefined, isObject, isString, isUndefined, LevelLogger,
  LogLevel,
  PromiseEx,
} from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import { type AccountInstance, isAccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { isQueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { ConfigPayload } from '@xyo-network/config-payload-plugin'
import { ConfigSchema } from '@xyo-network/config-payload-plugin'
import type { ModuleManifestPayload } from '@xyo-network/manifest-model'
import type {
  AddressPayload,
  AddressPreviousHashPayload,
  ArchivingModuleConfig,
  AttachableModuleInstance,
  CreatableModule,
  CreatableModuleFactory,
  CreatableModuleInstance,
  Labels,
  Module,
  ModuleBusyEventArgs,
  ModuleConfig,
  ModuleDescriptionPayload,
  ModuleDetailsError,
  ModuleEventData,
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQueries,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
  ModuleResolverInstance,
} from '@xyo-network/module-model'
import {
  AddressPreviousHashSchema,
  AddressSchema,
  creatableModule,
  DeadModuleError,
  isModuleName,
  isSerializable,
  ModuleAddressQuerySchema,
  ModuleConfigSchema,
  ModuleDescriptionSchema,
  ModuleFactory,
  ModuleManifestQuerySchema,
  ModuleStateQuerySchema,
  ModuleSubscribeQuerySchema,
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  ModuleError, Payload, Query, Schema,
} from '@xyo-network/payload-model'
import { QuerySchema } from '@xyo-network/query-payload-plugin'
import type { WalletInstance } from '@xyo-network/wallet-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { determineAccount } from './determineAccount.ts'
import { ModuleErrorBuilder } from './Error.ts'
import type { Queryable } from './QueryValidator/index.ts'
import { ModuleConfigQueryValidator, SupportedQueryValidator } from './QueryValidator/index.ts'

export const DefaultModuleQueries = [ModuleAddressQuerySchema, ModuleSubscribeQuerySchema, ModuleManifestQuerySchema, ModuleStateQuerySchema] as const

creatableModule()
export abstract class AbstractModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractCreatable<TParams, TEventData>
  implements Module<TParams, TEventData> {
  static readonly allowRandomAccount: boolean = true
  static readonly configSchemas: Schema[] = [ModuleConfigSchema]
  static readonly defaultConfigSchema: Schema = ModuleConfigSchema
  // eslint-disable-next-line sonarjs/public-static-readonly
  static override defaultLogger: Logger = new ConsoleLogger(LogLevel.warn)
  // eslint-disable-next-line sonarjs/public-static-readonly
  static enableLazyLoad = false
  static readonly labels: Labels = {}
  static readonly uniqueName = globallyUnique('AbstractModule', AbstractModule, 'xyo')

  protected static privateConstructorKey = Date.now().toString()

  protected _account: AccountInstance | undefined

  // cache manifest based on maxDepth
  protected _cachedManifests = new LRUCache<number, ModuleManifestPayload>({ max: 10, ttl: 1000 * 60 * 5 })

  protected _globalReentrancyMutex: Mutex | undefined

  protected _lastError?: ModuleDetailsError

  protected _moduleConfigQueryValidator: Queryable | undefined
  protected _supportedQueryValidator: Queryable | undefined

  private _busyCount = 0
  private _logger: Logger | undefined | null = undefined

  get account() {
    return assertEx(this._account, () => 'Missing account')
  }

  get additionalSigners(): AccountInstance[] {
    return this.params.additionalSigners ?? []
  }

  get address() {
    return this.account.address
  }

  get allowAnonymous() {
    return !!this.config.security?.allowAnonymous
  }

  get allowNameResolution() {
    return this.params.allowNameResolution ?? true
  }

  get archiving(): ArchivingModuleConfig['archiving'] | undefined {
    return this.config.archiving
  }

  get archivist() {
    return this.config.archivist
  }

  get config(): TParams['config'] & { schema: Schema } {
    return { ...this.params.config, schema: this.params.config.schema ?? ModuleConfigSchema }
  }

  get dead() {
    return this.status === 'error'
  }

  get ephemeralQueryAccountEnabled(): boolean {
    return !!this.params.ephemeralQueryAccountEnabled
  }

  get globalReentrancyMutex() {
    this._globalReentrancyMutex = this._globalReentrancyMutex ?? (this.reentrancy?.scope === 'global' ? new Mutex() : undefined)
    return this._globalReentrancyMutex
  }

  get id() {
    return this.modName ?? this.address
  }

  override get logger() {
    // we use null to prevent a second round of not creating a logger
    if (isUndefined(this._logger)) {
      const logLevel = this.config.logLevel
      const newLogger = this._logger ?? (this.params?.logger ? new IdLogger(this.params.logger, () => `${this.constructor.name}[${this.id}]`) : null)
      this._logger = (isObject(newLogger) && isDefined(logLevel)) ? new LevelLogger(newLogger, logLevel) : newLogger
    }
    return this._logger ?? undefined
  }

  get modName() {
    return this.config.name
  }

  get priority() {
    return ObjectResolverPriority.Normal
  }

  get queries(): Schema[] {
    return [...DefaultModuleQueries]
  }

  get reentrancy() {
    return this.config.reentrancy
  }

  override get statusReporter() {
    return this.params.statusReporter
  }

  get timestamp() {
    return this.config.timestamp ?? false
  }

  protected get moduleConfigQueryValidator(): Queryable {
    return assertEx(this._moduleConfigQueryValidator, () => 'ModuleConfigQueryValidator not initialized')
  }

  protected get supportedQueryValidator(): Queryable {
    return assertEx(this._supportedQueryValidator, () => 'SupportedQueryValidator not initialized')
  }

  abstract get downResolver(): ModuleResolverInstance

  abstract get upResolver(): ModuleResolverInstance

  static _getRootFunction(funcName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anyThis = this as any
    while (anyThis.__proto__[funcName]) {
      anyThis = anyThis.__proto__
    }
    return anyThis[funcName]
  }

  static _noOverride(functionName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisFunc = (this as any)[functionName]

    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, () => `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  static override async createHandler<T extends CreatableInstance>(
    inInstance: T,
  ) {
    const instance = (await super.createHandler(inInstance))
    if (instance instanceof AbstractModule) {
      if (this.configSchemas.length === 0) {
        throw new Error(`No allowed config schemas for [${this.name}]`)
      }

      const schema: Schema = instance.config.schema ?? this.defaultConfigSchema
      const allowedSchemas: Schema[] = this.configSchemas

      assertEx(this.isAllowedSchema(schema), () => `Bad Config Schema [Received ${schema}] [Expected ${JSON.stringify(allowedSchemas)}]`)
    } else {
      throw new TypeError(`Invalid instance type [${instance.constructor.name}] for [${this.name}]`)
    }

    return instance
  }

  static async determineAccount(params: {
    account?: AccountInstance | 'random'
    accountPath?: string
    wallet?: WalletInstance
  }): Promise<AccountInstance> {
    return await determineAccount(params, this.allowRandomAccount)
  }

  static factory<TModule extends CreatableModuleInstance>(
    this: CreatableModule<TModule>,
    params?: Partial<TModule['params']>,
  ): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams<TModule>(this, params)
  }

  static isAllowedSchema(schema: Schema): boolean {
    return this.configSchemas.includes(schema)
  }

  static override async paramsHandler<T extends AttachableModuleInstance<ModuleParams, ModuleEventData>>(
    inParams: Partial<T['params']> = {},
  ) {
    const superParams = await super.paramsHandler(inParams)
    const params = {
      ...superParams,
      account: await this.determineAccount(superParams),
      config: { schema: this.defaultConfigSchema, ...superParams.config },
      logger: superParams.logger ?? this.defaultLogger,
    } as T['params']
    return params
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  _getRootFunction(funcName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anyThis = this as any
    while (anyThis.__proto__[funcName]) {
      anyThis = anyThis.__proto__
    }
    return anyThis[funcName]
  }

  async busy<R>(closure: () => Promise<R>) {
    if (this._busyCount <= 0) {
      this._busyCount = 0
      const args: ModuleBusyEventArgs = { busy: true, mod: this }
      await this.emit('moduleBusy', args)
    }
    this._busyCount++
    try {
      return await closure()
    } finally {
      this._busyCount--
      if (this._busyCount <= 0) {
        this._busyCount = 0
        const args: ModuleBusyEventArgs = { busy: false, mod: this }
        await this.emit('moduleBusy', args)
      }
    }
  }

  override async createHandler() {
    await super.createHandler()
    assertEx(this.name === undefined || isModuleName(this.name), () => `Invalid module name: ${this.name}`)

    if (this.params.account === 'random') {
      this._account = await Account.random()
    } else if (isAccountInstance(this.params.account)) {
      this._account = this.params.account
    }

    assertEx(isAccountInstance(this._account), () => `Invalid account instance: ${this._account}`)

    this._supportedQueryValidator = new SupportedQueryValidator(this as Module).queryable
    this._moduleConfigQueryValidator = new ModuleConfigQueryValidator(this.config).queryable

    if (!AbstractModule.enableLazyLoad) {
      setTimeout(() => forget(this.start()), 200)
    }
  }

  override emit<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ) {
    return super.emit(eventName, eventArgs)
  }

  isSupportedQuery(query: Schema, assert: boolean | string = false): boolean {
    // check if ever supported
    if (!this.queries.includes(query)) {
      if (assert !== false) {
        assertEx(false, () => `Query not supported [${isString(assert) ? assert : query}] on [${this.modName}, ${this.address}] (queries list)`)
      }
      return false
    }
    // check if config allows it
    const supported = Array.isArray(this.config.allowedQueries) ? this.config.allowedQueries.includes(query) : true
    if (assert !== false) {
      assertEx(supported, () => `Query not supported [${isString(assert) ? assert : query}] on [${this.modName}, ${this.address}] (config)`)
    }
    return supported
  }

  previousHash(): Promisable<string | undefined> {
    this._checkDead()
    return this.account.previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    this._checkDead()
    this._noOverride('query')
    return await this.spanAsync('query', async () => {
      const sourceQuery = assertEx(isQueryBoundWitness(query) ? query : undefined, () => 'Unable to parse query')
      return await this.busy(async () => {
        const resultPayloads: Payload[] = []
        const errorPayloads: ModuleError[] = []
        const queryAccount = this.ephemeralQueryAccountEnabled ? await Account.random() : undefined

        try {
          await this.startedAsync('throw')
          if (!this.allowAnonymous && query.addresses.length === 0) {
            throw new Error(`Anonymous Queries not allowed, but running anyway [${this.modName}], [${this.address}]`)
          }
          if (queryConfig?.allowedQueries) {
            assertEx(queryConfig?.allowedQueries.includes(sourceQuery.schema), () => `Query not allowed [${sourceQuery.schema}]`)
          }
          resultPayloads.push(...(await this.queryHandler(sourceQuery, payloads, queryConfig)))
        } catch (ex) {
          await handleErrorAsync(ex, async (err) => {
            const error = err as ModuleDetailsError
            this._lastError = error
            // this.status = 'dead'
            errorPayloads.push(
              new ModuleErrorBuilder()
                .meta({ $sources: [await PayloadBuilder.dataHash(sourceQuery)] })
                .name(this.modName ?? '<Unknown>')
                .query(sourceQuery.schema)
                .details(error.details)
                .message(error.message)
                .build(),
            )
          })
        }
        if (this.timestamp) {
          const timestamp = { schema: 'network.xyo.timestamp', timestamp: Date.now() }
          resultPayloads.push(timestamp)
        }
        const result = await this.bindQueryResult(sourceQuery, resultPayloads, queryAccount ? [queryAccount] : [], errorPayloads)
        const args: ModuleQueriedEventArgs = {
          mod: this, payloads, query: sourceQuery, result,
        }
        await this.emit('moduleQueried', args)
        return result
      })
    }, { timeBudgetLimit: 200 })
  }

  async queryable<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<boolean> {
    if (this.dead) {
      return false
    }
    if (!(this.started('warn'))) return false
    const configValidator
      = queryConfig ? new ModuleConfigQueryValidator(Object.assign({}, this.config, queryConfig)).queryable : this.moduleConfigQueryValidator
    const validators = [this.supportedQueryValidator, configValidator]

    const results = await Promise.all(validators.map(validator => validator(query, payloads)))
    for (const result of results) {
      if (!result) {
        return false
      }
    }
    return true
  }

  protected _checkDead() {
    if (this.dead) {
      throw new DeadModuleError(this.id, this._lastError)
    }
  }

  protected async archivistInstance(): Promise<ArchivistInstance | undefined>
  protected async archivistInstance(required: true): Promise<ArchivistInstance>
  protected async archivistInstance(required = false): Promise<ArchivistInstance | undefined> {
    const archivist = this.archivist
    if (isUndefined(archivist)) {
      if (required) {
        throw new Error('No archivist specified')
      }
      return undefined
    }
    const resolved = (await this.upResolver.resolve(archivist)) ?? (await this.downResolver.resolve(archivist))
    if (required) {
      assertEx(resolved, () => `Unable to resolve archivist [${archivist}]`)
    }
    return resolved ? asArchivistInstance(resolved, () => `Specified archivist is not an Archivist [${archivist}]`) : undefined
  }

  protected bindHashes(hashes: Hash[], schema: Schema[], account?: AccountInstance) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
  }

  protected async bindHashesInternal(hashes: Hash[], schema: Schema[], account: AccountInstance = this.account): Promise<BoundWitness> {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).signer(account)
    const result: BoundWitness = (await builder.build())[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account?: AccountInstance,
    additionalSigners?: AccountInstance[],
  ): PromiseEx<[QueryBoundWitness, Payload[], Payload[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new PromiseEx<[QueryBoundWitness, Payload[], Payload[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account, additionalSigners)
      resolve?.(result)
      return result
    }, account)
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account: AccountInstance = this.account,
    additionalSigners: AccountInstance[] = [],
  ): Promise<[QueryBoundWitness, Payload[], Payload[]]> {
    const accounts = [account, ...additionalSigners].filter(exists)
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).signers(accounts).query(query)

    const [bw, payloadsOut, errors] = await builder.build()
    return [bw, [...payloadsOut], errors]
  }

  protected async bindQueryResult<T extends Query>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
    errors?: ModuleError[],
  ): Promise<ModuleQueryResult> {
    const queryDataHash = await PayloadBuilder.dataHash(query)
    const builder = new BoundWitnessBuilder().payloads(payloads).errors(errors).sourceQuery(queryDataHash)
    const witnesses = [this.account, ...additionalWitnesses].filter(exists)
    builder.signers(witnesses)
    const result = [
      PayloadBuilder.omitPrivateStorageMeta((await builder.build())[0]),
      PayloadBuilder.omitPrivateStorageMeta(payloads),
      PayloadBuilder.omitPrivateStorageMeta(errors ?? []),
    ] as ModuleQueryResult
    if (this.archiving && this.isAllowedArchivingQuery(query.schema)) {
      forget(this.storeToArchivists(result.flat()))
    }
    return result
  }

  protected generateConfigAndAddress(_maxDepth?: number): Promisable<Payload[]> {
    const config = this.config
    const address: AddressPayload = { schema: AddressSchema, address: this.address }
    const queries = this.queries.map((query) => {
      return { schema: QuerySchema, query }
    })
    const configSchema: ConfigPayload = {
      config: config.schema,
      schema: ConfigSchema,
    }
    return ([config, configSchema, address, ...queries]).filter(exists)
  }

  protected async generateDescribe(): Promise<ModuleDescriptionPayload> {
    const description: ModuleDescriptionPayload = {
      address: this.address,
      name: this.modName ?? `Unnamed ${this.constructor.name}`,
      queries: this.queries,
      schema: ModuleDescriptionSchema,
    }

    const discover = await this.generateConfigAndAddress()

    description.children = (
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address == this.address ? undefined : address
      }) ?? []
    ).filter(exists)

    return description
  }

  /** @deprecated use archivistInstance() instead */
  protected async getArchivist(): Promise<ArchivistInstance | undefined> {
    return await this.archivistInstance()
  }

  protected isAllowedArchivingQuery(schema: Schema): boolean {
    const queries = this.archiving?.queries
    if (queries) {
      return queries.includes(schema)
    }
    return true
  }

  protected manifestHandler(_maxDepth: number = 1, _ignoreAddresses: Address[] = []): Promisable<ModuleManifestPayload> {
    throw new Error('Not supported')
  }

  protected moduleAddressHandler(): Promisable<(AddressPreviousHashPayload | AddressPayload)[]> {
    const address = this.address
    const name = this.modName
    const previousHash = this.account.previousHash
    const moduleAccount = isDefined(name)
      ? {
          address, name, schema: AddressSchema,
        }
      : { address, schema: AddressSchema }
    const moduleAccountPreviousHash = isDefined(previousHash)
      ? {
          address, previousHash, schema: AddressPreviousHashSchema,
        }
      : { address, schema: AddressSchema }
    return [moduleAccount, moduleAccountPreviousHash]
  }

  protected async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    await this.startedAsync('throw')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
    const queryPayload = await wrapper.getQuery()
    assertEx(await this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    switch (queryPayload.schema) {
      case ModuleManifestQuerySchema: {
        resultPayloads.push(await this.manifestHandler(queryPayload.maxDepth))
        break
      }
      case ModuleAddressQuerySchema: {
        resultPayloads.push(...(await this.moduleAddressHandler()))
        break
      }
      case ModuleStateQuerySchema: {
        resultPayloads.push(...(await this.stateHandler()))
        break
      }
      case ModuleSubscribeQuerySchema: {
        this.subscribeHandler()
        break
      }
      default: {
        throw new Error(`Unsupported Query [${(queryPayload as Payload).schema}]`)
      }
    }
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads) as ModuleQueryHandlerResult
  }

  protected override async startHandler(): Promise<void> {
    this.validateConfig()
    await super.startHandler()
  }

  protected async stateHandler(): Promise<Payload[]> {
    return [await this.manifestHandler(), ...(await this.generateConfigAndAddress()), await this.generateDescribe()]
  }

  protected override async stopHandler(): Promise<void> {
    await super.stopHandler()
    this._startPromise = undefined
  }

  protected subscribeHandler() {
    return
  }

  protected validateConfig(config?: unknown, parents: string[] = []): boolean {
    // eslint-disable-next-line unicorn/no-array-reduce
    return Object.entries(config ?? this.config ?? {}).reduce((valid, [key, value]) => {
      switch (typeof value) {
        case 'function': {
          this.logger?.warn(`Fields of type function not allowed in config [${parents?.join('.')}.${key}]`)
          return false
        }
        case 'object': {
          if (Array.isArray(value)) {
            return (
              // eslint-disable-next-line unicorn/no-array-reduce
              value.reduce((valid, value) => {
                return this.validateConfig(value, [...parents, key]) && valid
              }, true) && valid
            )
          }

          if (!isSerializable(value)) {
            this.logger?.warn(`Fields that are not serializable to JSON are not allowed in config [${parents?.join('.')}.${key}]`)
            return false
          }
          return value ? this.validateConfig(value, [...parents, key]) && valid : true
        }
        default: {
          return valid
        }
      }
    }, true)
  }

  protected abstract certifyParents(): Promise<Payload[]>
  protected abstract storeToArchivists(payloads: Payload[]): Promise<Payload[]>
}
