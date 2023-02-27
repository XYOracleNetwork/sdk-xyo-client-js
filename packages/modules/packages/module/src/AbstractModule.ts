import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { Base } from '@xyo-network/core'
import {
  Module,
  ModuleConfig,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleQuery,
  ModuleQueryResult,
  ModuleSubscribeQuerySchema,
  SchemaString,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'

import { creatable } from './CreatableModule'
import { XyoErrorBuilder } from './Error'
import { serializableField } from './lib'
import { Logging } from './Logging'
import { AccountModuleParams, ModuleParams, WalletModuleParams } from './ModuleParams'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'
import { CompositeModuleResolver } from './Resolver'

@creatable()
export class AbstractModule<TConfig extends ModuleConfig = ModuleConfig> extends Base<ModuleParams<TConfig>> implements Module<TConfig> {
  static configSchema: string

  readonly resolver: CompositeModuleResolver

  protected _parentResolver = new CompositeModuleResolver()
  protected _started = false
  protected readonly account: AccountInstance
  protected readonly logger?: Logging
  protected readonly moduleConfigQueryValidator: Queryable

  protected readonly supportedQueryValidator: Queryable

  protected constructor(params: ModuleParams<TConfig>) {
    const activeLogger = params.logger ?? AbstractModule.defaultLogger
    //TODO: change wallet to use accountDerivationPath
    const account = (params as WalletModuleParams<TConfig>).wallet
      ? (params as WalletModuleParams<TConfig>).wallet.getAccount(0)
      : (params as AccountModuleParams<TConfig>).account
      ? (params as AccountModuleParams<TConfig>).account
      : undefined

    params.logger = activeLogger ? new Logging(activeLogger, () => `0x${this.account.addressValue.hex}`) : undefined
    super(params)
    this.account = this.loadAccount(account)
    this.resolver = (params.resolver ?? new CompositeModuleResolver()).add(this)
    this.supportedQueryValidator = new SupportedQueryValidator(this).queryable
    this.moduleConfigQueryValidator = new ModuleConfigQueryValidator(params?.config).queryable
    this.logger?.log(`Resolver: ${!!this.resolver}, Logger: ${!!this.logger}`)
  }

  get address() {
    return this.account.addressValue.hex
  }

  get allowAnonymous() {
    return !!this.config.security?.allowAnonymous
  }

  get config() {
    return this.params.config ?? {}
  }

  get parentResolver(): CompositeModuleResolver {
    return this._parentResolver
  }

  get previousHash() {
    return this.account.previousHash
  }

  get queries(): string[] {
    return [ModuleDiscoverQuerySchema, ModuleSubscribeQuerySchema]
  }

  static async create(params?: Partial<ModuleParams<ModuleConfig>>): Promise<AbstractModule> {
    params?.logger?.debug(`config: ${JSON.stringify(params.config, null, 2)}`)
    const actualParams: Partial<ModuleParams<ModuleConfig>> = params ?? {}
    actualParams.config = params?.config ?? { schema: assertEx(this.configSchema) }
    return await new this(actualParams as ModuleParams<ModuleConfig>).start()
  }

  discover(): Promisable<XyoPayload[]> {
    const config = this.config
    const address = new XyoPayloadBuilder<AddressPayload>({ schema: AddressSchema }).fields({ address: this.address, name: this.config.name }).build()
    const queries = this.queries.map((query) => {
      return new XyoPayloadBuilder<QueryPayload>({ schema: QuerySchema }).fields({ query }).build()
    })
    const configSchema: ConfigPayload = {
      config: config.schema,
      schema: ConfigSchema,
    }
    return compact([config, configSchema, address, ...queries])
  }

  async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): Promise<ModuleQueryResult> {
    this.started('throw')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
    if (!this.allowAnonymous) {
      if (query.addresses.length === 0) {
        console.warn(`Anonymous Queries not allowed, but running anyway [${this.config.name}], [${this.address}]`)
      }
    }
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query, payloads, queryConfig))
    const resultPayloads: XyoPayload[] = []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case ModuleDiscoverQuerySchema: {
          resultPayloads.push(...(await this.discover()))
          break
        }
        case ModuleSubscribeQuerySchema: {
          this.subscribe(queryAccount)
          break
        }
        default:
          console.error(`Unsupported Query [${query.schema}]`)
      }
    } catch (ex) {
      const error = ex as Error
      resultPayloads.push(new XyoErrorBuilder([wrapper.hash], error.message).build())
    }
    return this.bindResult(resultPayloads, queryAccount)
  }

  queryable<T extends XyoQueryBoundWitness = XyoQueryBoundWitness, TConfig extends ModuleConfig = ModuleConfig>(
    query: T,
    payloads?: XyoPayload[],
    queryConfig?: TConfig,
  ): boolean {
    if (!this.started('warn')) return false
    const configValidator = queryConfig
      ? new ModuleConfigQueryValidator(Object.assign({}, this.config, queryConfig)).queryable
      : this.moduleConfigQueryValidator
    const validators = [this.supportedQueryValidator, configValidator]
    return validators.every((validator) => validator(query, payloads))
  }

  //resolve will do a resolve from the perspective of the module (i.e. what can it and its children see?)
  async resolve(filter?: ModuleFilter): Promise<Module[]> {
    const resolver = assertEx(this._parentResolver, 'Parent resolver is required to call resolve')
    return (await resolver.resolve(filter)) ?? []
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

  protected bindHashesInternal(hashes: string[], schema: SchemaString[], account?: AccountInstance): XyoBoundWitness {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    const result = (account ? builder.witness(account) : builder).build()[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: AccountInstance,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], AccountInstance> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], AccountInstance>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: AccountInstance,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = (account ? builder.witness(account) : builder).build()
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindResult(payloads: XyoPayload[], account?: AccountInstance): PromiseEx<ModuleQueryResult, AccountInstance> {
    const promise = new PromiseEx<ModuleQueryResult, AccountInstance>((resolve) => {
      const result = this.bindResultInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindResultInternal(payloads: XyoPayload[], account?: AccountInstance): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().payloads(payloads).witness(this.account)
    const result: ModuleQueryResult = [(account ? builder.witness(account) : builder).build()[0], payloads]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected loadAccount(account?: AccountInstance) {
    return account ?? new Account()
  }

  protected start(_timeout?: number): Promisable<this> {
    this.validateConfig()
    this._started = true
    return this
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
}
