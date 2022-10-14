import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { Promisable, PromiseEx } from '@xyo-network/promise'
import { Logger } from '@xyo-network/shared'

import { AddressString, SchemaString, XyoModuleConfig } from './Config'
import { Module } from './Module'
import { ModuleQueryResult } from './ModuleQueryResult'
import {
  XyoModuleDiscoverQuerySchema,
  XyoModuleInitializeQuerySchema,
  XyoModuleQuery,
  XyoModuleShutdownQuerySchema,
  XyoModuleSubscribeQuerySchema,
} from './Queries'
import { QueryBoundWitnessBuilder, QueryBoundWitnessWrapper, XyoQuery, XyoQueryBoundWitness } from './Query'
import { ModuleResolver } from './Resolver'

export type SortedPipedAddressesString = string

export interface XyoModuleParams<TConfig extends XyoModuleConfig = XyoModuleConfig> {
  resolver?: ModuleResolver
  logger?: Logger
  account?: XyoAccount
  config?: TConfig
}

export abstract class XyoModule<TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module {
  protected initialized = false
  protected config?: TConfig
  protected allowedAddressSets?: Record<SchemaString, SortedPipedAddressesString[]>
  protected account: XyoAccount
  protected resolver?: ModuleResolver
  protected readonly logger?: Logger

  public get disallowedAddresses() {
    return this.config?.security?.disallowed
  }

  protected get log() {
    return this.logger
      ? (tag: string, message?: string | object | boolean | number) => {
          this.logger?.log(
            `${tag} [0x${this.account.addressValue.hex}] ${
              typeof message === 'string' ? message : typeof message === 'object' ? JSON.stringify(message, null, 2) : `${message}`
            }`,
          )
        }
      : undefined
  }

  protected get warn() {
    return this.logger
      ? (tag: string, message?: string | object | boolean | number) => {
          this.logger?.warn(
            `${tag} [0x${this.account.addressValue.hex}] ${
              typeof message === 'string' ? message : typeof message === 'object' ? JSON.stringify(message, null, 2) : `${message}`
            }`,
          )
        }
      : undefined
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

  constructor(params?: XyoModuleParams<TConfig>) {
    this.logger = params?.logger
    this.account = this.loadAccount(params?.account)
    this.resolver = params?.resolver
    this.log?.('Module Constructed', `Resolver: ${!!this.resolver}, Logger: ${!!this.logger}`)
    /* If a config is passed, we go ahead and initialize the module */
    if (params?.config) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.initialize(params?.config)
    }
  }

  protected loadAccount(account?: XyoAccount) {
    return account ?? new XyoAccount()
  }

  protected checkInitialized(tag: string) {
    if (!this.initialized) {
      this.warn?.(tag, 'Uninitialized')
    }
  }

  public get address() {
    return this.account.addressValue.hex
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

  public queryable(schema: SchemaString, addresses?: AddressString[]): boolean {
    this.checkInitialized('Queryable')
    return !!this.queries().includes(schema) && addresses
      ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true
      : true
  }

  public queries(): string[] {
    this.checkInitialized('Queries')
    return [XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleSubscribeQuerySchema, XyoModuleShutdownQuerySchema]
  }

  public async query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, payloads?: XyoPayload[]): Promise<ModuleQueryResult> {
    this.checkInitialized('Query')
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoModuleQuery>(query)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query.schema, wrapper.addresses))

    this.log?.('Query', wrapper.schemaName)

    const resultPayloads: XyoPayload[] = []
    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoModuleDiscoverQuerySchema: {
        this.discover(queryAccount)
        break
      }
      case XyoModuleInitializeQuerySchema: {
        await this.initialize(payloads?.[0] as TConfig, queryAccount)
        break
      }
      case XyoModuleSubscribeQuerySchema: {
        this.subscribe(queryAccount)
        break
      }
      case XyoModuleShutdownQuerySchema: {
        this.shutdown(queryAccount)
        break
      }
      default:
        console.error(`Unsupported Query [${query.schema}]`)
    }

    return this.bindResult(resultPayloads, queryAccount)
  }

  public discover(_queryAccount?: XyoAccount) {
    return
  }

  public initialize(config?: TConfig, _queryAccount?: XyoAccount): Promisable<void> {
    this.config = config
    this.initializeAllowedAddressSets()
    this.initialized = true
  }

  public subscribe(_queryAccount?: XyoAccount) {
    return
  }

  public shutdown(_queryAccount?: XyoAccount) {
    this.config = undefined
    this.allowedAddressSets = undefined
    this.initialized = false
  }

  protected bindHashesInternal(hashes: string[], schema: SchemaString[], account?: XyoAccount): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    return (account ? builder.witness(account) : builder).build()
  }

  protected bindHashes(hashes: string[], schema: SchemaString[], account?: XyoAccount) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  protected bindResultInternal(payloads: XyoPayloads, account?: XyoAccount): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().payloads(payloads).witness(this.account)
    return (account ? builder.witness(account) : builder).build()
  }

  protected bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayload[],
    account?: XyoAccount,
  ): [XyoQueryBoundWitness, XyoPayload[]] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    return (account ? builder.witness(account) : builder).build()
  }

  protected bindResult(payloads: XyoPayloads, account?: XyoAccount): PromiseEx<ModuleQueryResult, XyoAccount> {
    const promise = new PromiseEx<ModuleQueryResult, XyoAccount>((resolve) => {
      const result = this.bindResultInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
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

  static create<TConfig extends XyoModuleConfig>(_config?: TConfig): Promisable<XyoModule | null> {
    throw Error('Not implemented')
  }
}
