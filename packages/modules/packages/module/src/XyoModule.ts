import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { PromiseEx } from '@xyo-network/promise'

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

export type XyoModuleResolverFunc = (address: string) => XyoModule | null
export type SortedPipedAddressesString = string

export abstract class XyoModule<TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module {
  protected config?: TConfig
  protected allowedAddressSets?: Record<SchemaString, SortedPipedAddressesString[]>
  protected disallowedAddresses?: Record<SchemaString, AddressString[]>
  protected account: XyoAccount
  protected resolver?: XyoModuleResolverFunc

  private initializeAllowedAddressSets() {
    if (this.config?.security?.allowed) {
      const allowedAddressSets: Record<SchemaString, SortedPipedAddressesString[]> = {}
      Object.entries(this.config.security.allowed).forEach(([schema, addressesList]) => {
        allowedAddressSets[schema] = addressesList.map((addresses) => addresses.sort().join('|'))
      })
      this.allowedAddressSets = allowedAddressSets
    }
  }

  constructor(config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    this.config = { ...config, security: { allowed: config?.security?.allowed, disallowed: config?.security?.disallowed } } as TConfig
    this.initializeAllowedAddressSets()
    this.disallowedAddresses = this.config.security?.disallowed
    this.account = this.loadAccount(account)
    this.resolver = resolver
  }

  protected loadAccount(account?: XyoAccount) {
    return account ?? new XyoAccount()
  }

  public get address() {
    return this.account.addressValue.hex
  }

  private queryAllowed(schema: string, addresses: string[]) {
    return this?.allowedAddressSets?.[schema]?.includes(addresses.sort().join('|'))
  }

  private queryDisallowed(schema: string, addresses: string[]) {
    return addresses.reduce<boolean | undefined>(
      (previousValue, address) => previousValue || this?.disallowedAddresses?.[schema]?.includes(address),
      undefined,
    )
  }

  public queryable(schema: string, addresses?: string[]): boolean {
    return !!this.queries().includes(schema) && addresses
      ? this.queryAllowed(schema, addresses) ?? !this.queryDisallowed(schema, addresses) ?? true
      : true
  }

  public queries(): string[] {
    return [XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleSubscribeQuerySchema, XyoModuleShutdownQuerySchema]
  }

  public query<T extends XyoQueryBoundWitness = XyoQueryBoundWitness>(query: T, _payloads?: XyoPayloads): Promise<ModuleQueryResult> {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<XyoModuleQuery>(query)
    const typedQuery = wrapper.query.payload
    assertEx(this.queryable(query.schema, wrapper.addresses))

    const resultPayloads: (XyoPayload | null)[] = []
    const queryAccount = new XyoAccount()
    switch (typedQuery.schema) {
      case XyoModuleDiscoverQuerySchema: {
        this.discover(queryAccount)
        break
      }
      case XyoModuleInitializeQuerySchema: {
        this.initialize(queryAccount)
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

  discover(_queryAccount?: XyoAccount) {
    return
  }

  initialize(_queryAccount?: XyoAccount) {
    return
  }

  subscribe(_queryAccount?: XyoAccount) {
    return
  }

  shutdown(_queryAccount?: XyoAccount) {
    return
  }

  bindHashesInternal(hashes: string[], schema: string[], account?: XyoAccount): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    return (account ? builder.witness(account) : builder).build()
  }

  bindHashes(hashes: string[], schema: string[], account?: XyoAccount) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  bindResultInternal(payloads: XyoPayloads, account?: XyoAccount): ModuleQueryResult {
    const builder = new BoundWitnessBuilder().payloads(payloads).witness(this.account)
    return (account ? builder.witness(account) : builder).build()
  }

  bindQueryInternal<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayloads,
    account?: XyoAccount,
  ): [XyoQueryBoundWitness, XyoPayloads] {
    const builder = new QueryBoundWitnessBuilder().payloads(payloads).witness(this.account).query(query)
    return (account ? builder.witness(account) : builder).build()
  }

  bindResult(payloads: XyoPayloads, account?: XyoAccount): PromiseEx<ModuleQueryResult, XyoAccount> {
    const promise = new PromiseEx<ModuleQueryResult, XyoAccount>((resolve) => {
      const result = this.bindResultInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  bindQuery<T extends XyoQuery | PayloadWrapper<XyoQuery>>(
    query: T,
    payloads?: XyoPayloads,
    account?: XyoAccount,
  ): PromiseEx<[XyoQueryBoundWitness, XyoPayloads], XyoAccount> {
    const promise = new PromiseEx<[XyoQueryBoundWitness, XyoPayloads], XyoAccount>((resolve) => {
      const result = this.bindQueryInternal(query, payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }
}
