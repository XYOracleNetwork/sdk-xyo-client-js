import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { Logger } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { AddressString, SchemaString, XyoModuleConfig } from './Config'
import { Logging } from './Logging'
import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import { ModuleResolver } from './ModuleResolver'
import { XyoModuleDiscoverQuerySchema, XyoModuleQuery, XyoModuleSubscribeQuerySchema } from './Queries'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper, XyoErrorBuilder, XyoQuery, XyoQueryBoundWitness } from './Query'

export type SortedPipedAddressesString = string

export interface XyoModuleParams<TConfig extends XyoModuleConfig = XyoModuleConfig> {
  account?: XyoAccount
  config?: TConfig
  logger?: Logger
  resolver?: ModuleResolver
}

export class XyoModule<TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module {
  static configSchema: string
  static defaultLogger?: Logger

  protected _started = false
  protected account: XyoAccount
  protected allowedAddressSets?: Record<SchemaString, SortedPipedAddressesString[]>
  protected config?: TConfig
  protected readonly logger?: Logging
  protected resolver?: ModuleResolver

  protected constructor(params?: XyoModuleParams<TConfig>) {
    this.resolver = params?.resolver
    this.config = params?.config
    this.account = this.loadAccount(params?.account)
    const activeLogger = params?.logger ?? XyoModule.defaultLogger
    this.logger = activeLogger ? new Logging(activeLogger, `0x${this.account.addressValue.hex}`) : undefined
    this.logger?.log(`Resolver: ${!!this.resolver}, Logger: ${!!this.logger}`)
  }

  public get address() {
    return this.account.addressValue.hex
  }

  public get disallowedAddresses() {
    return this.config?.security?.disallowed
  }

  protected static async create(params?: XyoModuleParams<XyoModuleConfig>): Promise<XyoModule> {
    params?.logger?.debug(`config: ${JSON.stringify(params.config, null, 2)}`)
    const actualParams: XyoModuleParams<XyoModuleConfig> = params ?? {}
    actualParams.config = params?.config ?? { schema: this.configSchema }
    return await new this(actualParams).start()
  }

  public discover(_queryAccount?: XyoAccount) {
    return compact([this.config])
  }

  public queries(): string[] {
    return [XyoModuleDiscoverQuerySchema, XyoModuleSubscribeQuerySchema]
  }

  public query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, _payloads?: XyoPayload[]): Promisable<ModuleQueryResult> {
    this.started('throw')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoModuleQuery>(query)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query.schema, wrapper.addresses))

    this.logger?.log(wrapper.schemaName)

    const resultPayloads: XyoPayload[] = []
    const queryAccount = new XyoAccount()
    try {
      switch (typedQuery.schema) {
        case XyoModuleDiscoverQuerySchema: {
          resultPayloads.push(...this.discover(queryAccount))
          break
        }
        case XyoModuleSubscribeQuerySchema: {
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
      ? !!this.queries().includes(schema) && addresses
        ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true
        : true
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

  public subscribe(_queryAccount?: XyoAccount) {
    return
  }

  protected bindHashes(hashes: string[], schema: SchemaString[], account?: XyoAccount) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindHashesInternal(hashes: string[], schema: SchemaString[], account?: XyoAccount): XyoBoundWitness {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    const result = (account ? builder.witness(account) : builder).build()[0]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: XyoAccount,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], XyoAccount> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayload[]], XyoAccount>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: XyoAccount,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    const result = (account ? builder.witness(account) : builder).build()
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected bindResult(payloads: XyoPayload[], account?: XyoAccount): PromiseEx<ModuleQueryResult, XyoAccount> {
    const promise = new PromiseEx<ModuleQueryResult, XyoAccount>((resolve) => {
      const result = this.bindResultInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindResultInternal(payloads: XyoPayload[], account?: XyoAccount): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().payloads(payloads).witness(this.account)
    const result: ModuleQueryResult = [(account ? builder.witness(account) : builder).build()[0], payloads]
    this.logger?.debug(`result: ${JSON.stringify(result, null, 2)}`)
    return result
  }

  protected loadAccount(account?: XyoAccount) {
    return account ?? new XyoAccount()
  }

  protected start(_timeout?: number): Promisable<typeof this> {
    this.validateConfig()
    this.initializeAllowedAddressSets()
    this._started = true
    return this
  }

  protected stop(_timeout?: number): Promisable<typeof this> {
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
        case 'object':
          if (Array.isArray(value)) {
            return (
              value.reduce((valid, value) => {
                return this.validateConfig(value, [...parents, key]) && valid
              }, true) && valid
            )
          }
          if (value.__proto__) {
            this.logger?.warn(`Fields of type class not allowed in config [${parents?.join('.')}.${key}]`)
            return false
          }
          return this.validateConfig(value, [...parents, key]) && valid
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
