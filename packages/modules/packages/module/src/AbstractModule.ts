import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { Logger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { AbstractModuleConfig, AddressString, SchemaString } from './Config'
import { creatable } from './CreatableModule'
import { serializableField } from './lib'
import { Logging } from './Logging'
import { Module, ModuleParams, ModuleResolver } from './model'
import { ModuleDescription } from './ModuleDescription'
import { ModuleQueryResult } from './ModuleQueryResult'
import { AbstractModuleDiscoverQuerySchema, AbstractModuleQuery, AbstractModuleSubscribeQuerySchema } from './Queries'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQuery, XyoQueryBoundWitness } from './Query'

export type SortedPipedAddressesString = string

@creatable()
export class AbstractModule<TConfig extends AbstractModuleConfig = AbstractModuleConfig> implements Module {
  static configSchema: string
  static defaultLogger?: Logger

  public config: TConfig
  public resolver?: ModuleResolver

  protected _started = false
  protected account: Account
  protected allowedAddressSets?: Record<SchemaString, SortedPipedAddressesString[]>
  protected readonly logger?: Logging

  protected constructor(params: ModuleParams<TConfig>) {
    this.resolver = params.resolver
    this.config = params.config
    this.account = this.loadAccount(params?.account)
    const activeLogger = params?.logger ?? AbstractModule.defaultLogger
    this.logger = activeLogger ? new Logging(activeLogger, `0x${this.account.addressValue.hex}`) : undefined
    this.logger?.log(`Resolver: ${!!this.resolver}, Logger: ${!!this.logger}`)
  }

  public get address() {
    return this.account.addressValue.hex
  }

  public get disallowedAddresses() {
    return this.config?.security?.disallowed
  }

  static async create(params?: Partial<ModuleParams<AbstractModuleConfig>>): Promise<AbstractModule> {
    params?.logger?.debug(`config: ${JSON.stringify(params.config, null, 2)}`)
    const actualParams: Partial<ModuleParams<AbstractModuleConfig>> = params ?? {}
    actualParams.config = params?.config ?? { schema: assertEx(this.configSchema) }
    return await new this(actualParams as ModuleParams<AbstractModuleConfig>).start()
  }

  public description(): Promisable<ModuleDescription> {
    return { address: this.address, queries: this.queries() }
  }

  public discover(_queryAccount?: Account): Promisable<XyoPayload[]> {
    return compact([this.config])
  }

  public queries(): string[] {
    return [AbstractModuleDiscoverQuerySchema, AbstractModuleSubscribeQuerySchema]
  }

  public async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    this.started('throw')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<AbstractModuleQuery>(query, payloads)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(typedQuery.schema, wrapper.addresses))

    this.logger?.log(wrapper.schemaName)

    const resultPayloads: XyoPayload[] = []
    const queryAccount = new Account()
    try {
      switch (typedQuery.schema) {
        case AbstractModuleDiscoverQuerySchema: {
          resultPayloads.push(...(await this.discover(queryAccount)))
          break
        }
        case AbstractModuleSubscribeQuerySchema: {
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

  public queryable(schema: SchemaString, addresses?: AddressString[]): boolean {
    return this.started('warn')
      ? (() => {
          const includesQuery = !!this.queries().includes(schema)
          const allowed = addresses ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true : true
          return includesQuery && allowed
        })()
      : false
  }

  public started(notStartedAction?: 'error' | 'throw' | 'warn' | 'log' | 'none') {
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

  public subscribe(_queryAccount?: Account) {
    return
  }

  protected bindHashes(hashes: string[], schema: SchemaString[], account?: Account) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindHashesInternal(hashes: string[], schema: SchemaString[], account?: Account): XyoBoundWitness {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    const result = (account ? builder.witness(account) : builder).build()[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: Account,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], Account> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], Account>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: Account,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = (account ? builder.witness(account) : builder).build()
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindResult(payloads: XyoPayload[], account?: Account): PromiseEx<ModuleQueryResult, Account> {
    const promise = new PromiseEx<ModuleQueryResult, Account>((resolve) => {
      const result = this.bindResultInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindResultInternal(payloads: XyoPayload[], account?: Account): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().payloads(payloads).witness(this.account)
    const result: ModuleQueryResult = [(account ? builder.witness(account) : builder).build()[0], payloads]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected loadAccount(account?: Account) {
    return account ?? new Account()
  }

  protected start(_timeout?: number): Promisable<this> {
    this.validateConfig()
    this.initializeAllowedAddressSets()
    this._started = true
    return this
  }

  protected stop(_timeout?: number): Promisable<this> {
    this.allowedAddressSets = undefined
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

  private initializeAllowedAddressSets() {
    if (this.config?.security?.allowed) {
      const allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
      Object.entries(this.config.security.allowed).forEach(([schema, addressesList]) => {
        allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
      })
      this.allowedAddressSets = allowedAddressSets
    }
  }

  private queryAllowed(schema: SchemaString, addresses: AddressString[]) {
    return this?.allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }

  private queryDisallowed(schema: SchemaString, addresses: AddressString[]) {
    return addresses.reduce<boolean | undefined>(
      (previousValue, address) => previousValue || this?.disallowedAddresses?.[schema]?.includes(address),
      undefined,
    )
  }
}
