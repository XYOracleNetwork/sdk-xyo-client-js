import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { Account, HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { ArchivistModule } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import {
  AccountModuleParams,
  AddressPreviousHashPayload,
  AddressPreviousHashSchema,
  CreatableModule,
  CreatableModuleFactory,
  IndividualArchivistConfig,
  Module,
  ModuleAccountQuerySchema,
  ModuleConfig,
  ModuleDiscoverQuerySchema,
  ModuleEventData,
  ModuleFilter,
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQuery,
  ModuleQueryBase,
  ModuleQueryResult,
  ModuleSubscribeQuerySchema,
  Query,
  QueryBoundWitness,
  SchemaString,
  WalletModuleParams,
} from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { IdLogger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { BaseEmitter } from './BaseEmitter'
import { ModuleErrorBuilder } from './Error'
import { duplicateModules, serializableField } from './lib'
import { ModuleFactory } from './ModuleFactory'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'
import { CompositeModuleResolver } from './Resolver'

export abstract class AbstractModule<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends BaseEmitter<TParams, TEventData>
  implements Module<TParams, TEventData>
{
  static configSchema: string
  protected static privateConstructorKey = Date.now().toString()

  readonly downResolver = new CompositeModuleResolver()
  readonly upResolver = new CompositeModuleResolver()

  protected _account: AccountInstance | undefined = undefined
  protected readonly _baseModuleQueryAccountPaths: Record<ModuleQueryBase['schema'], string> = {
    'network.xyo.query.module.account': '1',
    'network.xyo.query.module.discover': '2',
    'network.xyo.query.module.subscribe': '3',
  }
  protected readonly _queryAccounts: Record<ModuleQueryBase['schema'], AccountInstance | undefined> = {
    'network.xyo.query.module.account': undefined,
    'network.xyo.query.module.discover': undefined,
    'network.xyo.query.module.subscribe': undefined,
  }
  protected _started = false
  protected readonly moduleConfigQueryValidator: Queryable
  protected readonly supportedQueryValidator: Queryable

  constructor(privateConstructorKey: string, params: TParams) {
    assertEx(AbstractModule.privateConstructorKey === privateConstructorKey, 'Use create function instead of constructor')
    // Clone params to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    super(mutatedParams)

    this.supportedQueryValidator = new SupportedQueryValidator(this as Module).queryable
    this.moduleConfigQueryValidator = new ModuleConfigQueryValidator(mutatedParams?.config).queryable
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

  get queries(): string[] {
    return [ModuleDiscoverQuerySchema, ModuleAccountQuerySchema, ModuleSubscribeQuerySchema]
  }

  get queryAccountPaths(): Readonly<Record<Query['schema'], string | undefined>> {
    return { ...this._baseModuleQueryAccountPaths, ...this._queryAccountPaths }
  }

  get queryAccounts(): Readonly<Record<Query['schema'], AccountInstance | undefined>> {
    return this._queryAccounts
  }

  protected abstract get _queryAccountPaths(): Record<Query['schema'], string>

  static async create<TModule extends Module>(this: CreatableModule<TModule>, params?: TModule['params']) {
    if (!this.configSchema) {
      throw Error(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }
    const schema = this.configSchema
    if (params?.config?.schema) {
      if (params?.config?.schema !== schema) {
        throw Error(`Bad Config Schema [Received ${params?.config?.schema}] [Expected ${schema}]`)
      }
    }
    params?.logger?.debug(`config: ${JSON.stringify(params?.config, null, 2)}`)
    const mutatedConfig = { ...params?.config, schema } as TModule['params']['config']
    const mutatedParams = { ...params, config: mutatedConfig } as TModule['params']
    const newModule = new this(AbstractModule.privateConstructorKey, mutatedParams)
    await newModule.loadAccount?.()
    await newModule.start?.()
    return newModule
  }

  static factory<TModule extends Module>(this: CreatableModule<TModule>, params?: TModule['params']): CreatableModuleFactory<TModule> {
    return ModuleFactory.withParams(this, params)
  }

  discover(): Promisable<Payload[]> {
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

  async loadAccount() {
    if (!this._account) {
      const activeLogger = this.params.logger ?? AbstractModule.defaultLogger
      let { account } = this.params as AccountModuleParams<TParams['config']>
      const { wallet, accountDerivationPath } = this.params as WalletModuleParams<TParams['config']>
      if (wallet) {
        account = assertEx(accountDerivationPath ? await wallet.derivePath(accountDerivationPath) : wallet, 'Failed to derive account from path')
      }
      this.params.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${account.address}`) : undefined
      this._account = account ?? Account.random()
    }
    this.downResolver.add(this as Module)
    return this._account
  }

  moduleAccountQuery(): Promisable<(AddressPayload | AddressPreviousHashPayload)[]> {
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

  async query<T extends QueryBoundWitness = QueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: Payload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    this.started('throw')
    const result = await this.queryHandler(assertEx(QueryBoundWitnessWrapper.unwrap(query)), payloads, queryConfig)

    const args: ModuleQueriedEventArgs = { module: this as Module, payloads, query, result }
    await this.emit('moduleQueried', args)

    return result
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
  ): PromiseEx<[QueryBoundWitness, Payload[]], AccountInstance> {
    const promise = new PromiseEx<[QueryBoundWitness, Payload[]], AccountInstance>(async (resolve) => {
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
  ): Promise<[QueryBoundWitness, Payload[]]> {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = await (account ? builder.witness(account) : builder).build()
    return result
  }

  protected async bindQueryResult<T extends Query | PayloadWrapper<Query>>(
    query: T,
    payloads: Payload[],
    additionalWitnesses: AccountInstance[] = [],
  ): Promise<[ModuleQueryResult, AccountInstance[]]> {
    const builder = new BoundWitnessBuilder().payloads(payloads)
    const queryWitnessAccount = this.queryAccounts[query.schema as ModuleQueryBase['schema']]
    const witnesses = [this.account, queryWitnessAccount, ...additionalWitnesses].filter(exists)
    builder.witnesses(witnesses)
    const result: ModuleQueryResult = [(await builder.build())[0], payloads]
    return [result, witnesses]
  }

  protected commitArchivist = () => this.getArchivist('commit')

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
    const queryAccount = await Account.random()
    try {
      switch (queryPayload.schema) {
        case ModuleDiscoverQuerySchema: {
          resultPayloads.push(...(await this.discover()))
          break
        }
        case ModuleAccountQuerySchema: {
          resultPayloads.push(...(await this.moduleAccountQuery()))
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
      const error = ex as Error
      resultPayloads.push(
        new ModuleErrorBuilder()
          .sources([await wrapper.hashAsync()])
          .message(error.message)
          .build(),
      )
    }
    return (await this.bindQueryResult(queryPayload, resultPayloads, [queryAccount]))[0]
  }

  protected readArchivist = () => this.getArchivist('read')

  protected async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this.upResolver.resolve<TModule>(filter)), ...(await this.downResolver.resolve<TModule>(filter))].filter(duplicateModules)
  }

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

  private async getArchivist(kind: keyof IndividualArchivistConfig): Promise<ArchivistModule | undefined> {
    if (!this.config.archivist) return undefined
    const filter =
      typeof this.config.archivist === 'string' || this.config.archivist instanceof String
        ? (this.config.archivist as string)
        : (this.config?.archivist?.[kind] as string)
    const resolved = await this.upResolver.resolveOne(filter)
    return resolved ? (resolved as ArchivistModule) : undefined
  }
}
