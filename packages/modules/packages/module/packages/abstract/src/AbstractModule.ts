/* eslint-disable max-lines */
import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder, QueryBoundWitness, QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { handleError, handleErrorAsync } from '@xyo-network/error'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  AnyConfigSchema,
  CreatableModule,
  CreatableModuleFactory,
  duplicateModules,
  IndividualArchivistConfig,
  Module,
  ModuleAddressQuerySchema,
  ModuleBusyEventArgs,
  ModuleConfig,
  ModuleDescribeQuerySchema,
  ModuleDescriptionPayload,
  ModuleDescriptionSchema,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleFactory,
  ModuleFilter,
  ModuleFilterOptions,
  ModuleInstance,
  ModuleManifestQuerySchema,
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQuery,
  ModuleQueryBase,
  ModuleQueryResult,
  ModuleResolver,
  ModuleSubscribeQuerySchema,
  SchemaString,
  serializableField,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { IdLogger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { BaseEmitter } from './BaseEmitter'
import { ModuleErrorBuilder } from './Error'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'
import { CompositeModuleResolver } from './Resolver'

export abstract class AbstractModule<
    TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<ModuleConfig>,
    TEventData extends ModuleEventData = ModuleEventData,
  >
  extends BaseEmitter<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  static configSchemas: string[]
  static enableBusy = false
  static enableLazyLoad = false

  protected static privateConstructorKey = Date.now().toString()

  readonly downResolver: Omit<CompositeModuleResolver, 'resolve'> = new CompositeModuleResolver()
  readonly upResolver: Omit<CompositeModuleResolver, 'resolve>'> = new CompositeModuleResolver()

  protected _account: AccountInstance | undefined = undefined
  protected readonly _baseModuleQueryAccountPaths: Record<ModuleQueryBase['schema'], string> = {
    [ModuleAddressQuerySchema]: '1',
    [ModuleDescribeQuerySchema]: '4',
    [ModuleDiscoverQuerySchema]: '2',
    [ModuleManifestQuerySchema]: '5',
    [ModuleSubscribeQuerySchema]: '3',
  }
  protected readonly _queryAccounts: Record<ModuleQueryBase['schema'], AccountInstance | undefined> = {
    [ModuleAddressQuerySchema]: undefined,
    [ModuleDescribeQuerySchema]: undefined,
    [ModuleDiscoverQuerySchema]: undefined,
    [ModuleManifestQuerySchema]: undefined,
    [ModuleSubscribeQuerySchema]: undefined,
  }
  protected _startPromise: Promisable<boolean> | undefined = undefined
  protected _started: Promisable<boolean> | undefined = undefined
  protected readonly moduleConfigQueryValidator: Queryable
  protected readonly supportedQueryValidator: Queryable

  private _busyCount = 0

  constructor(privateConstructorKey: string, params: TParams, account: AccountInstance) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, 'Use create function instead of constructor')
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
    return assertEx(this._account, 'Missing account')
  }

  get address() {
    return this.account.address
  }

  get allowAnonymous() {
    return !!this.config.security?.allowAnonymous
  }

  get config(): TParams['config'] {
    return this.params.config
  }

  get ephemeralQueryAccountEnabled(): boolean {
    return !!this.params.ephemeralQueryAccountEnabled
  }

  get queries(): string[] {
    return [ModuleDiscoverQuerySchema, ModuleAddressQuerySchema, ModuleSubscribeQuerySchema, ModuleDescribeQuerySchema, ModuleManifestQuerySchema]
  }

  get queryAccountPaths(): Readonly<Record<Query['schema'], string | undefined>> {
    return { ...this._baseModuleQueryAccountPaths, ...this._queryAccountPaths }
  }

  get queryAccounts(): Readonly<Record<Query['schema'], AccountInstance | undefined>> {
    return this._queryAccounts
  }

  protected abstract get _queryAccountPaths(): Record<Query['schema'], string>

  static async create<TModule extends ModuleInstance>(
    this: CreatableModule<TModule>,
    params?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ) {
    if (!this.configSchemas || this.configSchemas.length === 0) {
      throw Error(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }

    const { account, config, wallet, accountDerivationPath } = params ?? {}

    assertEx(
      !(!!account && !!wallet),
      `Specifying both {account} and {wallet} are not allowed [${config?.schema}] [${
        account === 'random' ? 'random' : account?.address
      }, ${wallet?.address}]`,
    )

    const schema: string = params?.config?.schema ?? this.configSchema
    const allowedSchemas: string[] = this.configSchemas

    assertEx(
      allowedSchemas.filter((allowedSchema) => allowedSchema === schema).length > 0,
      `Bad Config Schema [Received ${schema}] [Expected ${JSON.stringify(allowedSchemas)}]`,
    )
    const mutatedConfig: TModule['params']['config'] = { ...params?.config, schema }
    params?.logger?.debug(`config: ${JSON.stringify(mutatedConfig, null, 2)}`)
    const mutatedParams = { ...params, config: mutatedConfig } as TModule['params']

    //determine account
    const activeLogger = params?.logger ?? AbstractModule.defaultLogger
    let generatedAccount: AccountInstance | undefined = undefined
    if (wallet) {
      generatedAccount = assertEx(
        accountDerivationPath ? await wallet.derivePath(accountDerivationPath) : wallet,
        'Failed to derive account from path',
      )
    } else if (account === 'random') {
      generatedAccount = await HDWallet.random()
    } else if (account) {
      generatedAccount = account
    } else {
      //this should eventually be removed/thrown
      console.warn(`AbstractModule.create: No account provided - Creating Random account [${config?.schema}]`)
      generatedAccount = await HDWallet.random()
    }
    const address = generatedAccount.address
    mutatedParams.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${address}`) : undefined

    const newModule = new this(AbstractModule.privateConstructorKey, mutatedParams, generatedAccount)

    if (!AbstractModule.enableLazyLoad) {
      await newModule.start?.()
    }
    return newModule
  }

  static factory<TModule extends ModuleInstance>(
    this: CreatableModule<TModule>,
    params?: Omit<TModule['params'], 'config'> & { config?: TModule['params']['config'] },
  ): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams(this, params)
  }

  async busy<R>(closure: () => Promise<R>) {
    if (AbstractModule.enableBusy) {
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
    } else {
      return closure()
    }
  }

  previousHash(): Promisable<string | undefined> {
    return this.account.previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    return await this.busy(async () => {
      await this.started('throw')
      const result = await this.queryHandler(assertEx(QueryBoundWitnessWrapper.unwrap(query)), payloads, queryConfig)

      const args: ModuleQueriedEventArgs = { module: this, payloads, query, result }
      await this.emit('moduleQueried', args)

      return result
    })
  }

  queryable<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): boolean {
    if (!this.started('warn')) return false
    const configValidator = queryConfig
      ? new ModuleConfigQueryValidator(Object.assign({}, this.config, queryConfig)).queryable
      : this.moduleConfigQueryValidator
    const validators = [this.supportedQueryValidator, configValidator]

    return validators.every((validator) => validator(query, payloads))
  }

  async resolve(filter?: ModuleFilter, options?: ModuleFilterOptions): Promise<ModuleInstance[]>
  async resolve(nameOrAddress: string, options?: ModuleFilterOptions): Promise<ModuleInstance | undefined>
  async resolve(
    nameOrAddressOrFilter?: ModuleFilter | string,
    options?: ModuleFilterOptions,
  ): Promise<ModuleInstance | ModuleInstance[] | undefined> {
    const direction = options?.direction ?? 'all'
    const up = direction === 'up' || direction === 'all'
    const down = direction === 'down' || direction === 'all'
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (
          (down ? await (this.downResolver as CompositeModuleResolver).resolve(nameOrAddressOrFilter) : undefined) ??
          (up ? await (this.upResolver as ModuleResolver).resolve(nameOrAddressOrFilter) : undefined)
        )
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return [
          ...(down ? await (this.downResolver as CompositeModuleResolver).resolve(filter) : []),
          ...(up ? await (this.upResolver as ModuleResolver).resolve(filter) : []),
        ].filter(duplicateModules)
      }
    }
  }

  start(_timeout?: number): Promisable<boolean> {
    //using promise as mutex
    this._startPromise = this._startPromise ?? this.startHandler()
    return this._startPromise
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
          case 'throw':
            throw Error(`Module not Started [${this.address}]`)
          case 'warn':
            this.logger?.warn('Module not started')
            break
          case 'error':
            this.logger?.error('Module not started')
            break
          case 'none':
            break
          case 'log':
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
      return result
    })
  }

  protected bindHashes(hashes: string[], schema: SchemaString[], account?: AccountInstance) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected async bindHashesInternal(hashes: string[], schema: SchemaString[], account?: AccountInstance): Promise<BoundWitness> {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    const result = (await (account ? builder.witness(account) : builder).build())[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends Query>(
    query: T,
    payloads?: Payload[],
    account?: AccountInstance,
  ): PromiseEx<[QueryBoundWitness, Payload[], Payload[]], AccountInstance> {
    const promise = new PromiseEx<[QueryBoundWitness, Payload[], Payload[]], AccountInstance>(async (resolve) => {
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
  ): Promise<[QueryBoundWitness, Payload[], Payload[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async bindQueryResult<T extends Query>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
    errors?: ModuleError[],
  ): Promise<[ModuleQueryResult, AccountInstance[]]> {
    const builder = new BoundWitnessBuilder().payloads(payloads).errors(errors)
    const queryWitnessAccount = this.queryAccounts[query.schema as ModuleQueryBase['schema']]
    const witnesses = [this.account, queryWitnessAccount, ...additionalWitnesses].filter(exists)
    builder.witnesses(witnesses)
    const result: ModuleQueryResult = [(await builder.build())[0], payloads, errors ?? []]
    return [result, witnesses]
  }

  protected commitArchivist = () => this.getArchivist('commit')

  protected async describeHandler(): Promise<ModuleDescriptionPayload> {
    const description: ModuleDescriptionPayload = {
      address: this.address,
      queries: this.queries,
      schema: ModuleDescriptionSchema,
    }
    if (this.config?.name) {
      description.name = this.config.name
    }

    const discover = await this.discoverHandler()

    description.children = compact(
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address != this.address ? address : undefined
      }) ?? [],
    )

    return description
  }

  protected discoverHandler(): Promisable<Payload[]> {
    const config = this.config
    const address = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: this.address, name: this.config?.name }).build()
    const queries = this.queries.map((query) => {
      return new PayloadBuilder<QueryPayload>({ schema: QuerySchema }).fields({ query }).build()
    })
    const configSchema: ConfigPayload = {
      config: config.schema,
      schema: ConfigSchema,
    }
    return compact([config, configSchema, address, ...queries])
  }

  protected async initializeQueryAccounts() {
    // Ensure distinct/unique wallet paths
    const paths = Object.values(this.queryAccountPaths).filter(exists)
    const distinctPaths = new Set<string>(paths)
    assertEx(distinctPaths.size === paths.length, `${this.config?.name ? this.config.name + ': ' : ''}Duplicate query account paths`)
    // Create an account for query this module supports
    const wallet = this.account as unknown as HDWallet
    if (wallet?.derivePath) {
      for (const key in this.queryAccountPaths) {
        if (Object.prototype.hasOwnProperty.call(this.queryAccountPaths, key)) {
          const query = key as ModuleQueryBase['schema']
          const queryAccountPath = this.queryAccountPaths[query]
          if (queryAccountPath) {
            this._queryAccounts[query] = await wallet.derivePath?.(queryAccountPath)
          }
        }
      }
    }
  }

  protected manifestHandler(_ignoreAddresses?: string[]): Promisable<ModuleManifestPayload> {
    const name = this.config.name ?? 'Anonymous'
    return { config: { name, ...this.config }, schema: ModuleManifestPayloadSchema }
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
    const name = this.config.name
    const previousHash = this.address
    const moduleAccount = name ? { address, name, schema: AddressSchema } : { address, schema: AddressSchema }
    const moduleAccountPreviousHash = previousHash
      ? { address, previousHash, schema: AddressPreviousHashSchema }
      : { address, schema: AddressPreviousHashSchema }
    return [moduleAccount, moduleAccountPreviousHash, ...queryAccounts].flat()
  }

  protected async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    await this.started('throw')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
    if (!this.allowAnonymous) {
      if (query.addresses.length === 0) {
        console.warn(`Anonymous Queries not allowed, but running anyway [${this.config.name}], [${this.address}]`)
      }
    }
    const queryPayload = await wrapper.getQuery()
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: Payload[] = []
    const errorPayloads: ModuleError[] = []
    const queryAccount = this.ephemeralQueryAccountEnabled ? Account.randomSync() : undefined
    try {
      switch (queryPayload.schema) {
        case ModuleManifestQuerySchema: {
          resultPayloads.push(await this.manifestHandler())
          break
        }
        case ModuleDiscoverQuerySchema: {
          resultPayloads.push(...(await this.discoverHandler()))
          break
        }
        case ModuleDescribeQuerySchema: {
          resultPayloads.push(await this.describeHandler())
          break
        }
        case ModuleAddressQuerySchema: {
          resultPayloads.push(...(await this.moduleAddressHandler()))
          break
        }
        case ModuleSubscribeQuerySchema: {
          this.subscribeHandler(queryAccount)
          break
        }
        default:
          console.error(`Unsupported Query [${(queryPayload as Payload).schema}]`)
      }
    } catch (ex) {
      await handleErrorAsync(ex, async (error) => {
        errorPayloads.push(
          new ModuleErrorBuilder()
            .sources([await wrapper.hashAsync()])
            .name(this.config.name ?? '<Unknown>')
            .query(query.schema)
            .message(error.message)
            .build(),
        )
      })
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, queryAccount ? [queryAccount] : [], errorPayloads))[0]
  }

  protected readArchivist = () => this.getArchivist('read')

  protected async startHandler(): Promise<boolean> {
    this.validateConfig()
    await this.initializeQueryAccounts()
    this._started = true
    return true
  }

  protected stopHandler(_timeout?: number): Promisable<boolean> {
    this._started = undefined
    return true
  }

  protected subscribeHandler(_queryAccount?: AccountInstance) {
    return
  }

  protected validateConfig(config?: unknown, parents: string[] = []): boolean {
    return Object.entries(config ?? this.config ?? {}).reduce((valid, [key, value]) => {
      switch (typeof value) {
        case 'function':
          this.logger?.warn(`Fields of type function not allowed in config [${parents?.join('.')}.${key}]`)
          return false
        case 'object': {
          if (Array.isArray(value)) {
            return (
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
        default:
          return valid
      }
    }, true)
  }

  protected writeArchivist = () => this.getArchivist('write')

  private async getArchivist(kind: keyof IndividualArchivistConfig): Promise<ArchivistInstance | undefined> {
    if (!this.config.archivist) return undefined
    const filter =
      typeof this.config.archivist === 'string' || this.config.archivist instanceof String
        ? (this.config.archivist as string)
        : (this.config?.archivist?.[kind] as string)
    const resolved = await this.upResolver.resolve(filter)
    return asArchivistInstance(resolved)
  }
}
