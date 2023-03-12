import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { ConfigPayload, ConfigSchema } from '@xyo-network/config-payload-plugin'
import { Base } from '@xyo-network/core'
import {
  AccountModuleParams,
  EventAnyListener,
  EventDataParams,
  EventFunctions,
  EventListener,
  Module,
  ModuleConfig,
  ModuleDiscoverQuerySchema,
  ModuleFilter,
  ModuleParams,
  ModuleQueriedEventArgs,
  ModuleQuery,
  ModuleQueryResult,
  ModuleSubscribeQuerySchema,
  SchemaString,
  WalletModuleParams,
  XyoQuery,
  XyoQueryBoundWitness,
} from '@xyo-network/module-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import compact from 'lodash/compact'

import { creatableModule } from './CreatableModule'
import { XyoErrorBuilder } from './Error'
import { Events } from './Events'
import { IdLogger } from './IdLogger'
import { duplicateModules, serializableField } from './lib'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper } from './Query'
import { ModuleConfigQueryValidator, Queryable, SupportedQueryValidator } from './QueryValidator'
import { CompositeModuleResolver } from './Resolver'

export class BaseEmitter<TParams extends EventDataParams = EventDataParams> extends Base<TParams> implements EventFunctions<TParams['eventData']> {
  private events: Events<TParams['eventData']>

  constructor(params: TParams) {
    super(params)
    this.events = new Events(params.eventData)
  }

  clearListeners(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][]) {
    return this.events.clearListeners(eventNames)
  }

  emit(eventName: keyof TParams['eventData'], eventArgs?: TParams['eventData'][keyof TParams['eventData']]) {
    return this.events.emit(eventName, eventArgs)
  }

  emitSerial(eventName: keyof TParams['eventData'], eventArgs?: TParams['eventData'][keyof TParams['eventData']]) {
    return this.events.emitSerial(eventName, eventArgs)
  }

  listenerCount(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][]) {
    return this.events.listenerCount(eventNames)
  }

  off(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.off(eventNames, listener)
  }

  offAny(listener: EventAnyListener<TParams['eventData']>) {
    return this.events.offAny(listener)
  }

  on(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.on(eventNames, listener)
  }

  onAny(listener: EventAnyListener<TParams['eventData']>) {
    return this.events.onAny(listener)
  }

  once(eventNames: keyof TParams['eventData'] | keyof TParams['eventData'][], listener: EventListener<TParams['eventData']>) {
    return this.events.once(eventNames, listener)
  }
}

@creatableModule()
export class AbstractModule<TParams extends ModuleParams = ModuleParams> extends BaseEmitter<TParams> implements Module<TParams>, Module {
  static configSchema: string

  readonly downResolver = new CompositeModuleResolver()
  readonly upResolver = new CompositeModuleResolver()

  protected _started = false
  protected readonly account: AccountInstance
  protected readonly moduleConfigQueryValidator: Queryable

  protected readonly supportedQueryValidator: Queryable

  protected constructor(params: TParams) {
    //we copy this to prevent mutation of the incoming object
    const mutatedParams = { ...params } as TParams
    const activeLogger = params.logger ?? AbstractModule.defaultLogger
    //TODO: change wallet to use accountDerivationPath
    const account: AccountInstance | undefined = (mutatedParams as WalletModuleParams<TParams['config'], TParams['eventData']>).wallet
      ? Account.fromPrivateKey(
          (mutatedParams as WalletModuleParams<TParams['config']>).wallet.derivePath(
            (mutatedParams as WalletModuleParams<TParams['config']>).accountDerivationPath,
          ).privateKey,
        )
      : (mutatedParams as AccountModuleParams<TParams['config']>).account
      ? (mutatedParams as AccountModuleParams<TParams['config']>).account
      : undefined

    mutatedParams.logger = activeLogger ? new IdLogger(activeLogger, () => `0x${this.account.addressValue.hex}`) : undefined
    super(mutatedParams)
    this.account = this.loadAccount(account)
    this.downResolver.add(this)
    this.supportedQueryValidator = new SupportedQueryValidator(this).queryable
    this.moduleConfigQueryValidator = new ModuleConfigQueryValidator(mutatedParams?.config).queryable
  }

  get address() {
    return this.account.addressValue.hex
  }

  get allowAnonymous() {
    return !!this.config.security?.allowAnonymous
  }

  get config(): TParams['config'] {
    return this.params.config
  }

  get previousHash() {
    return this.account.previousHash
  }

  get queries(): string[] {
    return [ModuleDiscoverQuerySchema, ModuleSubscribeQuerySchema]
  }

  static async create<TParams extends ModuleParams>(params?: TParams): Promise<Module> {
    if (!this.configSchema) {
      this.defaultLogger?.log(`Missing configSchema [${params?.config?.schema}][${this.name}]`)
    }
    const schema = this.configSchema
    if (params?.config?.schema) {
      if (params?.config?.schema !== schema) {
        this.defaultLogger?.log(`Bad Config Schema [Received ${params?.config?.schema}] [Expected ${schema}]`)
      }
    }
    params?.logger?.debug(`config: ${JSON.stringify(params?.config, null, 2)}`)
    const mutatedConfig = { ...params?.config, schema } as TParams['config']
    const mutatedParams = { ...params, config: mutatedConfig } as TParams
    //console.log(`Create-config: ${JSON.stringify(mutatedConfig)}`)
    return await new this<TParams>(mutatedParams).start()
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
    const result = await this.bindResult(resultPayloads, queryAccount)

    const args: ModuleQueriedEventArgs = { module: this, payloads, query, result }
    await this.emit('moduleQueried', args)

    return result
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
    //this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
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
    return result
  }

  protected loadAccount(account?: AccountInstance): AccountInstance {
    return account ?? new Account()
  }

  protected async resolve<TModule extends Module = Module>(filter?: ModuleFilter): Promise<TModule[]> {
    return [...(await this.upResolver.resolve<TModule>(filter)), ...(await this.downResolver.resolve<TModule>(filter))].filter(duplicateModules)
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
