import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { IndirectArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder, QueryBoundWitness, QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { handleErrorAsync } from '@xyo-network/error'
import { ModuleManifestPayload, ModuleManifestPayloadSchema } from '@xyo-network/manifest-model'
import {
  AccountModuleParams,
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  CreatableModule,
  CreatableModuleFactory,
  DirectModule,
  duplicateModules,
  IndirectModule,
  IndividualArchivistConfig,
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
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQuery,
  ModuleQueryBase,
  ModuleQueryResult,
  ModuleSubscribeQuerySchema,
  SchemaString,
  serializableField,
  WalletModuleParams,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { ModuleError, Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { IdLogger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { BaseEmitter } from './BaseEmitter'
import { ModuleErrorBuilder } from './Error'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'
import { CompositeModuleResolver } from './Resolver'

/** @description Abstract class for modules that allow access only through querying and not through direct calls  */

export abstract class AbstractIndirectModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends BaseEmitter<TParams, TEventData>
  implements IndirectModule<TParams, TEventData>, IndirectModule
{
  static configSchemas: string[]

  protected static privateConstructorKey = Date.now().toString()

  readonly downResolver = new CompositeModuleResolver()
  readonly upResolver = new CompositeModuleResolver()

  protected _account: AccountInstance | undefined = undefined
  protected readonly _baseModuleQueryAccountPaths: Record<ModuleQueryBase['schema'], string> = {
    [ModuleAddressQuerySchema]: '1',
    [ModuleDescribeQuerySchema]: '4',
    [ModuleDiscoverQuerySchema]: '2',
    [ModuleSubscribeQuerySchema]: '3',
  }
  protected readonly _queryAccounts: Record<ModuleQueryBase['schema'], AccountInstance | undefined> = {
    [ModuleAddressQuerySchema]: undefined,
    [ModuleDescribeQuerySchema]: undefined,
    [ModuleDiscoverQuerySchema]: undefined,
    [ModuleSubscribeQuerySchema]: undefined,
  }
  protected _started = false
  protected readonly moduleConfigQueryValidator: Queryable
  protected readonly supportedQueryValidator: Queryable

  private _busyCount = 0

  constructor(privateConstructorKey: string, params: TParams) {
    assertEx(AbstractIndirectModule.privateConstructorKey === privateConstructorKey, 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(mutatedParams)

    this.supportedQueryValidator = new SupportedQueryValidator(this as IndirectModule).queryable
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
    return [ModuleDiscoverQuerySchema, ModuleAddressQuerySchema, ModuleSubscribeQuerySchema]
  }

  get queryAccountPaths(): Readonly<Record<Query['schema'], string | undefined>> {
    return { ...this._baseModuleQueryAccountPaths, ...this._queryAccountPaths }
  }

  get queryAccounts(): Readonly<Record<Query['schema'], AccountInstance | undefined>> {
    return this._queryAccounts
  }

  protected abstract get _queryAccountPaths(): Record<Query['schema'], string>

  static async create<TModule extends IndirectModule>(this: CreatableModule<TModule>, params?: TModule['params']) {
    if (!this.configSchemas || this.configSchemas.length === 0) {
      throw Error(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }
    const schema: string = params?.config?.schema ?? this.configSchema
    const allowedSchemas: string[] = this.configSchemas

    assertEx(
      allowedSchemas.filter((allowedSchema) => allowedSchema === schema).length > 0,
      `Bad Config Schema [Received ${schema}] [Expected ${JSON.stringify(allowedSchemas)}]`,
    )
    const mutatedConfig: TModule['params']['config'] = { ...params?.config, schema }
    params?.logger?.debug(`config: ${JSON.stringify(mutatedConfig, null, 2)}`)
    const mutatedParams = { ...params, config: mutatedConfig } as TModule['params']
    const newModule = new this(AbstractIndirectModule.privateConstructorKey, mutatedParams)
    await newModule.loadAccount?.()
    await newModule.start?.()
    return newModule
  }

  static factory<TModule extends IndirectModule>(this: CreatableModule<TModule>, params?: TModule['params']): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams(this, params)
  }

  addressPreviousHash(): Promisable<AddressPreviousHashPayload> {
    return { address: this.address, previousHash: this._account?.previousHash, schema: AddressPreviousHashSchema }
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

  async loadAccount() {
    if (!this._account) {
      const activeLogger = this.params.logger ?? AbstractIndirectModule.defaultLogger
      let { account } = this.params as AccountModuleParams<TParams['config']>
      const { wallet, accountDerivationPath } = this.params as WalletModuleParams<TParams['config']>
      if (wallet) {
        account = assertEx(accountDerivationPath ? await wallet.derivePath(accountDerivationPath) : wallet, 'Failed to derive account from path')
      }
      this.params.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${account.address}`) : undefined
      if (!account) console.warn(`AbstractModule.loadAccount: No account provided - Creating Random account [${this.config.schema}]`)
      this._account = account ?? (await HDWallet.random())
    }
    this.downResolver.add(this as IndirectModule)
    return this._account
  }

  manifest(): Promisable<ModuleManifestPayload> {
    const name = assertEx(this.config.name, 'Calling manifest on un-named module is not supported')
    return { config: { name, ...this.config }, schema: ModuleManifestPayloadSchema }
  }

  moduleAddressQuery(): Promisable<(AddressPayload | AddressPreviousHashPayload)[]> {
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

  previousHash(): Promisable<string | undefined> {
    return this.account.previousHash
  }

  async query<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    this.started('throw')
    return await this.busy(async () => {
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

  async resolve<TModule extends IndirectModule = IndirectModule>(filter?: ModuleFilter): Promise<TModule[]>
  async resolve<TModule extends IndirectModule = IndirectModule>(nameOrAddress: string): Promise<TModule | undefined>
  async resolve<TModule extends IndirectModule = IndirectModule>(
    nameOrAddressOrFilter?: ModuleFilter | string,
  ): Promise<TModule | TModule[] | undefined> {
    switch (typeof nameOrAddressOrFilter) {
      case 'string': {
        return (await this.downResolver.resolve<TModule>(nameOrAddressOrFilter)) ?? (await this.upResolver.resolve<TModule>(nameOrAddressOrFilter))
      }
      default: {
        const filter: ModuleFilter | undefined = nameOrAddressOrFilter
        return [...(await this.downResolver.resolve<TModule>(filter)), ...(await this.upResolver.resolve<TModule>(filter))].filter(duplicateModules)
      }
    }
  }

  async start(_timeout?: number): Promise<void> {
    this.validateConfig()
    await this.initializeQueryAccounts()
    this._started = true
  }

  started(notStartedAction?: 'error' | 'throw' | 'warn' | 'log' | 'none') {
    if (!this._started) {
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
        default:
          this.logger?.log('Module not started')
      }
    }
    return this._started
  }

  subscribe(_queryAccount?: AccountInstance) {
    return
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

  protected bindQuery<T extends Query | PayloadWrapper<Query>>(
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

  protected async bindQueryInternal<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads?: Payload[],
    account?: AccountInstance,
  ): Promise<[QueryBoundWitness, Payload[], Payload[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async bindQueryResult<T extends Query | PayloadWrapper<Query>>(
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

  protected async describe(): Promise<ModuleDescriptionPayload> {
    const description: ModuleDescriptionPayload = {
      address: this.address,
      queries: this.queries,
      schema: ModuleDescriptionSchema,
    }
    if (this.config.name) {
      description.name = this.config.name
    }

    const discover = await this.discover()

    description.children = compact(
      discover?.map((payload) => {
        const address = payload.schema === AddressSchema ? (payload as AddressPayload).address : undefined
        return address != this.address ? address : undefined
      }) ?? [],
    )

    return description
  }

  protected discover(): Promisable<Payload[]> {
    const config = this.config
    const address = new PayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: this.address, name: this.config.name }).build()
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

  protected async queryHandler<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    this.started('throw')
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
    const queryAccount = this.ephemeralQueryAccountEnabled ? await HDWallet.random() : undefined
    try {
      switch (queryPayload.schema) {
        case ModuleDiscoverQuerySchema: {
          resultPayloads.push(...(await this.discover()))
          break
        }
        case ModuleDescribeQuerySchema: {
          resultPayloads.push(await this.describe())
          break
        }
        case ModuleAddressQuerySchema: {
          resultPayloads.push(...(await this.moduleAddressQuery()))
          break
        }
        case ModuleSubscribeQuerySchema: {
          this.subscribe(queryAccount)
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

  protected stop(_timeout?: number): Promisable<this> {
    this._started = false
    return this
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
    return resolved ? IndirectArchivistWrapper.wrap(resolved, this.account) : undefined
  }
}
