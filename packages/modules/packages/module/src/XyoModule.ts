import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload'
import { PromiseEx } from '@xyo-network/promise'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoModuleSubscribeQuerySchema } from './Queries'
import { XyoQuery } from './Query'

export type XyoModuleResolverFunc = (address: string) => XyoModule | null

export abstract class XyoModule<TQuery extends XyoQuery = XyoQuery, TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module<TQuery> {
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

  public query(query: TQuery): Promise<XyoModuleQueryResult> {
    const payloads: (XyoPayload | null)[] = []
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

  bindHashesInternal(hashes: string[], schema: string[], account?: XyoAccount): XyoModuleQueryResult {
    const builder = new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account)
    return [(account ? builder.witness(account) : builder).build(), []]
  }

  bindHashes(hashes: string[], schema: string[], account?: XyoAccount) {
    const promise = new PromiseEx((resolve) => {
      const result = this.bindHashesInternal(hashes, schema, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }

  bindPayloadsInternal(payloads: XyoPayloads, account?: XyoAccount): XyoModuleQueryResult {
    const builder = new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account)
    return [(account ? builder.witness(account) : builder).build(), payloads]
  }

  bindPayloads(payloads: XyoPayloads, account?: XyoAccount): PromiseEx<XyoModuleQueryResult, XyoAccount> {
    const promise = new PromiseEx<XyoModuleQueryResult, XyoAccount>((resolve) => {
      const result = this.bindPayloadsInternal(payloads, account)
      resolve?.(result)
      return result
    }, account)
    return promise
  }
}
