/* eslint-disable complexity */
/* eslint-disable max-lines */
import { assertEx } from '@xylabs/assert'
import { handleError, handleErrorAsync } from '@xylabs/error'
import { exists } from '@xylabs/exists'
import { Address, Hash } from '@xylabs/hex'
import { compact } from '@xylabs/lodash'
import { ConsoleLogger, IdLogger, Logger, LogLevel } from '@xylabs/logger'
import { Base, globallyUnique } from '@xylabs/object'
import { Promisable, PromiseEx } from '@xylabs/promise'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder, QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  ArchivingModuleConfig,
  CreatableModule,
  CreatableModuleFactory,
  CreatableModuleInstance,
  DeadModuleError,
  isModuleName,
  Module,
  ModuleAddressQuerySchema,
  ModuleBusyEventArgs,
  ModuleConfig,
  ModuleConfigSchema,
  ModuleDescriptionPayload,
  ModuleDescriptionSchema,
  ModuleEventData,
  ModuleFactory,
  ModuleManifestQuerySchema,
  ModuleName,
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
  serializableField,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload, Query, Schema, WithMeta } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { WalletInstance } from '@xyo-network/wallet-model'

import { BaseEmitter } from './BaseEmitter'
import { determineAccount } from './determineAccount'
import { ModuleErrorBuilder } from './Error'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'

export abstract class AbstractModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends BaseEmitter<TParams, TEventData>
  implements Module<TParams['config'], TEventData>
{
  static readonly allowRandomAccount: boolean = true
  static configSchemas: string[]
  static override defaultLogger: Logger = new ConsoleLogger(LogLevel.warn)
  static enableLazyLoad = false
  static override readonly uniqueName = globallyUnique('AbstractModule', AbstractModule, 'xyo')

  protected static privateConstructorKey = Date.now().toString()

  protected _account: AccountInstance | undefined = undefined
  protected readonly _baseModuleQueryAccountPaths: Record<ModuleQueries['schema'], string> = {
    [ModuleAddressQuerySchema]: '1',
    [ModuleManifestQuerySchema]: '5',
    [ModuleStateQuerySchema]: '6',
    [ModuleSubscribeQuerySchema]: '3',
  }
  protected _lastError?: Error
  protected readonly _queryAccounts: Record<ModuleQueries['schema'], AccountInstance | undefined> = {
    [ModuleAddressQuerySchema]: undefined,
    [ModuleManifestQuerySchema]: undefined,
    [ModuleStateQuerySchema]: undefined,
    [ModuleSubscribeQuerySchema]: undefined,
  }
  protected _startPromise: Promisable<boolean> | undefined = undefined
  protected _started: Promisable<boolean> | undefined = undefined
  protected readonly moduleConfigQueryValidator: Queryable
  protected readonly supportedQueryValidator: Queryable

  private _busyCount = 0
  private _status: ModuleStatus = 'stopped'

  protected constructor(privateConstructorKey: string, params: TParams, account: AccountInstance) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(mutatedParams)

    this._account = account

    this.supportedQueryValidator = new SupportedQueryValidator(this as Module).queryable
    this.moduleConfigQueryValidator = new ModuleConfigQueryValidator(mutatedParams?.config).queryable
  }

  static get configSchema(): string {
    return this.configSchemas[0]
  }

  get account() {
    return assertEx(this._account, () => 'Missing account')
  }

  get address() {
    return this.account.address
  }

  get allowAnonymous() {
    return !!this.config?.security?.allowAnonymous
  }

  get archiving(): ArchivingModuleConfig['archiving'] | undefined {
    return this.config?.archiving
  }

  get config() {
    return this.params?.config
  }

  get dead() {
    return this.status === 'dead'
  }

  get ephemeralQueryAccountEnabled(): boolean {
    return !!this.params?.ephemeralQueryAccountEnabled
  }

  get id() {
    return this.config?.name ?? this.address
  }

  get priority() {
    return ObjectResolverPriority.Normal
  }

  get queries(): string[] {
    return [ModuleAddressQuerySchema, ModuleSubscribeQuerySchema, ModuleManifestQuerySchema, ModuleStateQuerySchema]
  }

  get queryAccountPaths(): Readonly<Record<Query['schema'], string | undefined>> {
    return { ...this._baseModuleQueryAccountPaths, ...this._queryAccountPaths }
  }

  get queryAccounts(): Readonly<Record<Query['schema'], AccountInstance | undefined>> {
    return this._queryAccounts
  }

  get status() {
    return this._status
  }

  get timestamp() {
    return this.config?.timestamp ?? false
  }

  protected get baseModuleQueryAccountPaths(): Record<ModuleQueries['schema'], string> {
    return this._baseModuleQueryAccountPaths
  }

  protected override get logger() {
    return this.params?.logger ?? AbstractModule.defaultLogger ?? Base.defaultLogger
  }

  protected set status(value: ModuleStatus) {
    if (this._status !== 'dead') {
      this._status = value
    }
  }

  abstract get downResolver(): ModuleResolverInstance

  abstract get upResolver(): ModuleResolverInstance

  protected abstract get _queryAccountPaths(): Record<Query['schema'], string>

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, () => `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  static async create<TModule extends CreatableModuleInstance>(
    this: CreatableModule<TModule>,
    params?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ) {
    this._noOverride('create')
    if (!this.configSchemas || this.configSchemas.length === 0) {
      throw new Error(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }

    assertEx(params?.config?.name === undefined || isModuleName(params.config.name), () => `Invalid module name: ${params?.config?.name}`)

    const { account } = params ?? {}

    const schema: string = params?.config?.schema ?? this.configSchema
    const allowedSchemas: string[] = this.configSchemas

    assertEx(allowedSchemas.includes(schema), () => `Bad Config Schema [Received ${schema}] [Expected ${JSON.stringify(allowedSchemas)}]`)
    const mutatedConfig: TModule['params']['config'] = { ...params?.config, schema } as TModule['params']['config']
    params?.logger?.debug(`config: ${JSON.stringify(mutatedConfig, null, 2)}`)
    const mutatedParams: TModule['params'] = { ...params, config: mutatedConfig } as TModule['params']

    const activeLogger = params?.logger ?? AbstractModule.defaultLogger
    const generatedAccount = await AbstractModule.determineAccount({ account })
    const address = generatedAccount.address
    mutatedParams.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${address}`) : undefined

    const newModule = new this(AbstractModule.privateConstructorKey, mutatedParams, generatedAccount)

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

  static factory<TModule extends CreatableModuleInstance>(
    this: CreatableModule<TModule>,
    params?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams(this, params)
  }

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
      const args: ModuleBusyEventArgs = { busy: true, module: this }
      await this.emit('moduleBusy', args)
    }
    this._busyCount++
    try {
      return await closure()
    } finally {
      this._busyCount--
      if (this._busyCount <= 0) {
        this._busyCount = 0
        const args: ModuleBusyEventArgs = { busy: false, module: this }
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
    const sourceQuery = await PayloadBuilder.build(assertEx(QueryBoundWitnessWrapper.unwrap(query), () => 'Invalid query'))
    return await this.busy(async () => {
      const resultPayloads: Payload[] = []
      const errorPayloads: ModuleError[] = []
      const queryAccount = this.ephemeralQueryAccountEnabled ? Account.randomSync() : undefined
      try {
        await this.started('throw')
        if (!this.allowAnonymous && query.addresses.length === 0) {
          throw new Error(`Anonymous Queries not allowed, but running anyway [${this.config?.name}], [${this.address}]`)
        }
        if (queryConfig?.allowedQueries) {
          assertEx(queryConfig?.allowedQueries.includes(sourceQuery.schema), () => `Query not allowed [${sourceQuery.schema}]`)
        }
        resultPayloads.push(...(await this.queryHandler(sourceQuery, payloads, queryConfig)))
      } catch (ex) {
        await handleErrorAsync(ex, async (error) => {
          this._lastError = error
          //this.status = 'dead'
          errorPayloads.push(
            await new ModuleErrorBuilder()
              .sources([sourceQuery.$hash])
              .name(this.config?.name ?? '<Unknown>')
              .query(sourceQuery.schema)
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
      const args: ModuleQueriedEventArgs = { module: this, payloads, query: sourceQuery, result }
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
    const configValidator =
      queryConfig ? new ModuleConfigQueryValidator(Object.assign({}, this.config, queryConfig)).queryable : this.moduleConfigQueryValidator
    const validators = [this.supportedQueryValidator, configValidator]

    return validators.every((validator) => validator(query, payloads))
  }

  start(_timeout?: number): Promisable<boolean> {
    //using promise as mutex
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
      //using promise as mutex
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
            throw new Error(`Module not Started [${this.address}]`)
          }
          case 'warn': {
            this.logger?.warn('Module not started')
            break
          }
          case 'error': {
            this.logger?.error('Module not started')
            break
          }
          case 'none': {
            break
          }
          default: {
            this.logger?.log('Module not started')
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

  protected _noOverride(functionName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisFunc = (this as any)[functionName]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootFunc = this._getRootFunction(functionName)
    assertEx(thisFunc === rootFunc, () => `Override not allowed for [${functionName}] - override ${functionName}Handler instead`)
  }

  protected bindHashes(hashes: Hash[], schema: Schema[], account?: AccountInstance) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindHashesInternal(hashes: Hash[], schema: Schema[], account?: AccountInstance): Promise<BoundWitness> {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    const result = (await (account ? builder.witness(account) : builder).build())[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account?: AccountInstance,
  ): PromiseEx<[WithMeta<QueryBoundWitness>, WithMeta<Payload>[], WithMeta<Payload>[]], AccountInstance> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const promise = new PromiseEx<[WithMeta<QueryBoundWitness>, WithMeta<Payload>[], WithMeta<Payload>[]], AccountInstance>(async (resolve) => {
      const result = await this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindQueryInternal<T extends Query>(
    query: T,
    payloads?: Payload[],
    account?: AccountInstance,
  ): Promise<[WithMeta<QueryBoundWitness>, WithMeta<Payload>[], WithMeta<Payload>[]]> {
    const builder = await (await new QueryBoundWitnessBuilder().payloads(payloads)).witness(this.account).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async bindQueryResult<T extends Query>(
    query: WithMeta<T>,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
    errors?: ModuleError[],
  ): Promise<ModuleQueryResult> {
    const builder = (await (await new BoundWitnessBuilder().payloads(payloads)).errors(errors)).sourceQuery(query.$hash)
    const queryWitnessAccount = this.queryAccounts[query.schema as ModuleQueries['schema']]
    const witnesses = [this.account, queryWitnessAccount, ...additionalWitnesses].filter(exists)
    builder.witnesses(witnesses)
    const result: ModuleQueryResult = [
      (await builder.build())[0],
      await Promise.all(payloads.map((payload) => PayloadBuilder.build(payload))),
      await Promise.all((errors ?? [])?.map((error) => PayloadBuilder.build(error))),
    ]
    if (this.archiving) {
      await this.storeToArchivists(result.flat())
    }
    return result
  }

  protected async generateConfigAndAddress(_maxDepth?: number): Promise<Payload[]> {
    const config = this.config ? await PayloadBuilder.build(this.config) : undefined
    const address = await new PayloadBuilder<AddressPayload>({ schema: AddressSchema })
      .fields({ address: this.address, name: this.config?.name })
      .build()
    const queries = await Promise.all(
      this.queries.map(async (query) => {
        return await new PayloadBuilder<QueryPayload>({ schema: QuerySchema }).fields({ query }).build()
      }),
    )
    const configSchema =
      config ?
        await PayloadBuilder.build<ConfigPayload>({
          config: config.schema,
          schema: ConfigSchema,
        })
      : undefined
    return compact([config, configSchema, address, ...queries])
  }

  protected async generateDescribe(): Promise<ModuleDescriptionPayload> {
    const description: ModuleDescriptionPayload = {
      address: this.address,
      queries: this.queries,
      schema: ModuleDescriptionSchema,
    }
    if (this.config?.name) {
      description.name = this.config.name
    }

    const discover = await this.generateConfigAndAddress()

    description.children = compact(
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address == this.address ? undefined : address
      }) ?? [],
    )

    return description
  }

  protected async getArchivist(): Promise<ArchivistInstance | undefined> {
    if (!this.config?.archivist) return undefined
    const resolved = await this.upResolver.resolve(this.config.archivist)
    return asArchivistInstance(resolved)
  }

  protected async initializeQueryAccounts() {
    // Ensure distinct/unique wallet paths
    const paths = Object.values(this.queryAccountPaths).filter(exists)
    const distinctPaths = new Set<string>(paths)
    assertEx(distinctPaths.size === paths.length, () => `${this.config?.name ? this.config.name + ': ' : ''}Duplicate query account paths`)
    // Create an account for query this module supports
    const wallet = this.account as unknown as HDWallet
    if (wallet?.derivePath) {
      for (const key in this.queryAccountPaths) {
        if (Object.prototype.hasOwnProperty.call(this.queryAccountPaths, key)) {
          const query = key as ModuleQueries['schema']
          const queryAccountPath = this.queryAccountPaths[query]
          if (queryAccountPath) {
            this._queryAccounts[query] = await wallet.derivePath?.(queryAccountPath)
          }
        }
      }
    }
  }

  protected async manifestHandler(maxDepth: number = 1, _ignoreAddresses: Address[] = []): Promise<ModuleManifestPayload> {
    const name = this.config?.name ?? 'Anonymous'
    const children = await this.downResolver.resolve('*', { direction: 'down', maxDepth })
    const childAddressToName: Record<Address, ModuleName | null> = {}
    for (const child of children) {
      if (child.address !== this.address) {
        childAddressToName[child.address] = child.config?.name ?? null
      }
    }
    return {
      config: { name, schema: ModuleConfigSchema, ...this.config },
      schema: ModuleManifestPayloadSchema,
      status: { address: this.address, children: childAddressToName },
    }
  }

  protected moduleAddressHandler(): Promisable<AddressPreviousHashPayload[]> {
    // Return array of all addresses and their previous hash
    const queryAccounts = Object.entries(this.queryAccounts)
      .filter((value): value is [string, AccountInstance] => {
        return exists(value[1])
      })
      .map(([name, account]) => {
        const address = account.address
        const previousHash = account.previousHash
        return [
          { address, name, schema: AddressSchema },
          { address, previousHash, schema: AddressPreviousHashSchema },
        ]
      })
    const address = this.address
    const name = this.config?.name
    const previousHash = this.address
    const moduleAccount = name ? { address, name, schema: AddressSchema } : { address, schema: AddressSchema }
    const moduleAccountPreviousHash =
      previousHash ? { address, previousHash, schema: AddressPreviousHashSchema } : { address, schema: AddressPreviousHashSchema }
    return [moduleAccount, moduleAccountPreviousHash, ...queryAccounts].flat()
  }

  protected async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryHandlerResult> {
    await this.started('throw')
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
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
    return resultPayloads
  }

  protected async startHandler(): Promise<boolean> {
    this.validateConfig()
    await this.initializeQueryAccounts()
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

          if (!serializableField(value)) {
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

  protected abstract storeToArchivists(payloads: Payload[]): Promise<Payload[]>
}
