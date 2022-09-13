import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { PromiseEx } from '@xyo-network/promise'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoModuleSubscribeQuerySchema } from './Queries'
import { XyoQuery } from './Query'

export type XyoModuleResolverFunc = (address: string) => XyoModule | null

export abstract class XyoModule<
  TConfig extends XyoModuleConfig = XyoModuleConfig,
  TQuery extends XyoQuery = XyoQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> implements Module<TQuery, TQueryResult>
{
  protected config?: TConfig
  protected account: XyoAccount
  protected resolver?: XyoModuleResolverFunc
  constructor(config?: TConfig, account?: XyoAccount, resolver?: XyoModuleResolverFunc) {
    this.config = config
    this.account = account ?? new XyoAccount()
    this.resolver = resolver
  }

  public get address() {
    return this.account.addressValue.hex
  }

  public queryable(schema: string): boolean {
    console.log(`Queryable: ${JSON.stringify(schema)}`)
    console.log(`QueryableList: ${JSON.stringify(this.queries(), null, 2)}`)
    return !!this.queries().find((item) => item === schema)
  }

  public queries(): TQuery['schema'][] {
    return [XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleSubscribeQuerySchema, XyoModuleShutdownQuerySchema]
  }

  public query(query: TQuery): Promise<XyoModuleQueryResult<TQueryResult>> {
    const payloads: (TQueryResult | null)[] = []
    const queryAccount = new XyoAccount()
    switch (query.schema) {
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
    }

    return this.bindPayloads(payloads, queryAccount)
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

  bindHashesInternal(hashes: string[], schema: string[]): XyoModuleQueryResult<TQueryResult> {
    return [new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build(), []]
  }

  bindHashes(hashes: string[], schema: string[], queryAccount: XyoAccount) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema)
      resolve?.(result)
      return result
    }, queryAccount)
    return promise
  }

  bindPayloadsInternal(payloads: (TQueryResult | null)[]): XyoModuleQueryResult<TQueryResult> {
    return [new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build(), payloads]
  }

  bindPayloads(payloads: (TQueryResult | null)[], account?: XyoAccount): PromiseEx<XyoModuleQueryResult<TQueryResult>, XyoAccount> {
    const promise = new PromiseEx<XyoModuleQueryResult<TQueryResult>, XyoAccount>((resolve) => {
      const result = this.bindPayloadsInternal(payloads)
      resolve?.(result)
      return result
    }, account ?? this.account)
    return promise
  }
}
