/* eslint-disable complexity */
/* eslint-disable max-lines */
import { assertEx } from '@xylabs/assert'
import { handleError, handleErrorAsync } from '@xylabs/error'
import { exists } from '@xylabs/exists'
import { forget } from '@xylabs/forget'
import { Address, Hash } from '@xylabs/hex'
import {
  ConsoleLogger, IdLogger, Logger,
  LogLevel,
} from '@xylabs/logger'
import { Base, globallyUnique } from '@xylabs/object'
import { Promisable, PromiseEx } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  BoundWitness, isQueryBoundWitness, QueryBoundWitness,
} from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { BaseEmitter } from '@xyo-network/module-event-emitter'
import {
  AddressPayload,
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  AddressSchema,
  ArchivingModuleConfig,
  AttachableModuleInstance,
  CreatableModule,
  CreatableModuleFactory,
  DeadModuleError,
  isModuleName,
  isSerializable,
  Labels,
  Module,
  ModuleAddressQuerySchema,
  ModuleBusyEventArgs,
  ModuleConfig,
  ModuleConfigSchema,
  ModuleDescriptionPayload,
  ModuleDescriptionSchema,
  ModuleDetailsError,
  ModuleEventData,
  ModuleFactory,
  ModuleManifestQuerySchema,
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQueries,
  ModuleQueryHandlerResult,
  ModuleQueryResult,
  ModuleResolverInstance,
  ModuleStateQuerySchema,
  ModuleStatus,
  ModuleSubscribeQuerySchema,
  ObjectResolverPriority,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  ModuleError, Payload, Query, Schema,
} from '@xyo-network/payload-model'
import { QuerySchema } from '@xyo-network/query-payload-plugin'
import { WalletInstance } from '@xyo-network/wallet-model'
import { Mutex } from 'async-mutex'
import { LRUCache } from 'lru-cache'

import { determineAccount } from './determineAccount.ts'
import { ModuleErrorBuilder } from './Error.ts'
import {
  ModuleConfigQueryValidator, Queryable, SupportedQueryValidator,
} from './QueryValidator/index.ts'

const MODULE_NOT_STARTED = 'Module not Started' as const
export abstract class AbstractModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends BaseEmitter<TParams, TEventData>
  implements Module<TParams, TEventData> {
  static readonly allowRandomAccount: boolean = true
  static readonly configSchemas: Schema[] = [ModuleConfigSchema]
  static readonly defaultConfigSchema: Schema = ModuleConfigSchema
  // eslint-disable-next-line sonarjs/public-static-readonly
  static override defaultLogger: Logger = new ConsoleLogger(LogLevel.warn)
  // eslint-disable-next-line sonarjs/public-static-readonly
  static enableLazyLoad = false
  static readonly labels: Labels = {}
  static override readonly uniqueName = globallyUnique('AbstractModule', AbstractModule, 'xyo')

  protected static privateConstructorKey = Date.now().toString()

  protected _account: AccountInstance

  // cache manifest based on maxDepth
  protected _cachedManifests = new LRUCache<number, ModuleManifestPayload>({ max: 10, ttl: 1000 * 60 * 5 })

  protected _globalReentrancyMutex: Mutex | undefined = undefined

  protected _lastError?: ModuleDetailsError

  protected _startPromise: Promisable<boolean> | undefined = undefined
  protected _started: Promisable<boolean> | undefined = undefined
  protected readonly moduleConfigQueryValidator: Queryable
  protected readonly supportedQueryValidator: Queryable

  private _busyCount = 0
  private _logger: Logger | undefined = undefined
  private _status: ModuleStatus = 'stopped'

  constructor(privateConstructorKey: string, params: TParams, account: AccountInstance) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(mutatedParams)

    this._account = account

    this.supportedQueryValidator = new SupportedQueryValidator(this as Module).queryable
    this.moduleConfigQueryValidator = new ModuleConfigQueryValidator(mutatedParams?.config).queryable
  }

  get account() {
    return assertEx(this._account, () => 'Missing account')
  }

  get additionalSigners(): AccountInstance[] {
    return this.params.additionalSigners ?? []
  }

  get address() {
    return this._account?.address
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

  get config(): TParams['config'] {
    return this.params.config
  }

  get dead() {
    return this.status === 'dead'
  }

  get ephemeralQueryAccountEnabled(): boolean {
    return !!this.params.ephemeralQueryAccountEnabled
  }

  get globalReentrancyMutex() {
    this._globalReentrancyMutex = this._globalReentrancyMutex ?? this.reentrancy?.scope === 'global' ? new Mutex() : undefined
    return this._globalReentrancyMutex
  }

  get id() {
    return this.modName ?? this.address
  }

  override get logger() {
    const logLevel = this.config.logLevel
    this._logger
      = (this._logger ?? logLevel) ? new ConsoleLogger(logLevel) : (this.params?.logger ?? AbstractModule.defaultLogger ?? Base.defaultLogger)
    return this._logger
  }

  get modName() {
    return this.config.name
  }

  get priority() {
    return ObjectResolverPriority.Normal
  }

  get queries(): Schema[] {
    return [ModuleAddressQuerySchema, ModuleSubscribeQuerySchema, ModuleManifestQuerySchema, ModuleStateQuerySchema]
  }

  get reentrancy() {
    return this.config.reentrancy
  }

  get status() {
    return this._status
  }

  get timestamp() {
    return this.config.timestamp ?? false
  }

  protected set status(value: ModuleStatus) {
    if (this._status !== 'dead') {
      this._status = value
    }
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

  static async create<TModule extends AttachableModuleInstance>(
    this: CreatableModule<TModule>,
    params: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ) {
    this._noOverride('create')
    if (!this.configSchemas || this.configSchemas.length === 0) {
      throw new Error(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }

    if (!this.defaultConfigSchema) {
      throw new Error(`Missing defaultConfigSchema [${params?.config?.schema}][${this.name}]`)
    }

    assertEx(params?.config?.name === undefined || isModuleName(params.config.name), () => `Invalid module name: ${params?.config?.name}`)

    const { account } = params ?? {}

    const schema: Schema = params?.config?.schema ?? this.defaultConfigSchema
    const allowedSchemas: Schema[] = this.configSchemas

    assertEx(allowedSchemas.includes(schema), () => `Bad Config Schema [Received ${schema}] [Expected ${JSON.stringify(allowedSchemas)}]`)
    const mutatedConfig: TModule['params']['config'] = { ...params?.config, schema } as TModule['params']['config']
    params?.logger?.debug(`config: ${JSON.stringify(mutatedConfig, null, 2)}`)
    const mutatedParams: TModule['params'] = { ...params, config: mutatedConfig } as TModule['params']

    const activeLogger = params?.logger ?? AbstractModule.defaultLogger
    const generatedAccount = await AbstractModule.determineAccount({ account })
    const address = generatedAccount.address
    mutatedParams.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${address}`) : undefined

    const newModule = new this(AbstractModule.privateConstructorKey, mutatedParams, generatedAccount, address)

    if (!AbstractModule.enableLazyLoad) {
      await newModule.start?.()
    }
    return newModule
  }

  static async determineAccount(params: {
    account?: AccountInstance | 'random'
    accountPath?: string
    wallet?: WalletInstance
  }): Promise<AccountInstance> {
    return await determineAccount(params, this.allowRandomAccount)
  }

  static factory<TModule extends AttachableModuleInstance>(
    this: CreatableModule<TModule>,
    params: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams(this, params)
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

  override emit<TEventName extends keyof TEventData = keyof TEventData, TEventArgs extends TEventData[TEventName] = TEventData[TEventName]>(
    eventName: TEventName,
    eventArgs: TEventArgs,
  ) {
    return super.emit(eventName, eventArgs)
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
    const sourceQuery = assertEx(isQueryBoundWitness(query) ? query : undefined, () => 'Unable to parse query')
    return await this.busy(async () => {
      const resultPayloads: Payload[] = []
      const errorPayloads: ModuleError[] = []
      const queryAccount = this.ephemeralQueryAccountEnabled ? await Account.random() : undefined

      try {
        await this.started('throw')
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
  }

  async queryable<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<boolean> {
    if (this.dead) {
      return false
    }
    if (!(await this.started('warn'))) return false
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

  start(_timeout?: number): Promisable<boolean> {
    // using promise as mutex
    this._startPromise = this._startPromise ?? this.startHandler()
    const result = this._startPromise
    this.status = result ? 'started' : 'dead'
    return result
  }

  async started(notStartedAction: 'error' | 'throw' | 'warn' | 'log' | 'none' = 'log', tryStart = true): Promise<boolean> {
    const started = await this._started
    if (started === true) {
      return true
    }
    if (!started) {
      // using promise as mutex
      this._started = (async () => {
        if (tryStart) {
          try {
            await this.start()
            return true
          } catch (ex) {
            handleError(ex, (error) => {
              this.logger?.warn(`Autostart of Module Failed: ${error.message})`)
              this._started = undefined
            })
          }
        }
        switch (notStartedAction) {
          case 'throw': {
            throw new Error(`${MODULE_NOT_STARTED} [${this.address}]`)
          }
          case 'warn': {
            this.logger?.warn(MODULE_NOT_STARTED)
            break
          }
          case 'error': {
            this.logger?.error(MODULE_NOT_STARTED)
            break
          }
          case 'none': {
            break
          }
          default: {
            this.logger?.log(MODULE_NOT_STARTED)
            break
          }
        }
        return false
      })()
    }
    if (!this._started) {
      throw 'Failed to create start promise'
    }
    return await this._started
  }

  async stop(_timeout?: number): Promise<boolean> {
    return await this.busy(async () => {
      const result = await this.stopHandler()
      this._started = undefined
      this._startPromise = undefined
      this.status = result ? 'stopped' : 'dead'
      return result
    })
  }

  protected _checkDead() {
    if (this.dead) {
      throw new DeadModuleError(this.id, this._lastError)
    }
  }

  // eslint-disable-next-line sonarjs/no-identical-functions
  protected _noOverride(functionName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisFunc = (this as any)[functionName]

    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, () => `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  protected async archivistInstance(): Promise<ArchivistInstance | undefined>
  protected async archivistInstance(required: true): Promise<ArchivistInstance>
  protected async archivistInstance(required = false): Promise<ArchivistInstance | undefined> {
    const archivist = this.archivist
    if (!archivist) {
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
    const result: ModuleQueryResult = [
      PayloadBuilder.omitPrivateStorageMeta((await builder.build())[0]),
      PayloadBuilder.omitPrivateStorageMeta(payloads),
      PayloadBuilder.omitPrivateStorageMeta(errors ?? []),
    ]
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
      queries: this.queries,
      schema: ModuleDescriptionSchema,
    }
    if (this.config?.name) {
      description.name = this.modName
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
    const previousHash = this.address
    const moduleAccount = name
      ? {
          address, name, schema: AddressSchema,
        }
      : { address, schema: AddressSchema }
    const moduleAccountPreviousHash = previousHash
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
    await this.started('throw')
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
    return PayloadBuilder.omitPrivateStorageMeta(resultPayloads)
  }

  protected async startHandler(): Promise<boolean> {
    this.validateConfig()
    await Promise.resolve()
    this._started = true
    return true
  }

  protected async stateHandler(): Promise<Payload[]> {
    return [await this.manifestHandler(), ...(await this.generateConfigAndAddress()), await this.generateDescribe()]
  }

  protected stopHandler(_timeout?: number): Promisable<boolean> {
    this._started = undefined
    return true
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
