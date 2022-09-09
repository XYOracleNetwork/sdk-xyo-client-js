import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleShutdownQuerySchema, XyoModuleSubscribeQuerySchema } from './Queries'
import { XyoQuery } from './Query'

export type XyoModuleResolverFunc = (address: string) => XyoModule

export abstract class XyoModule<
  TConfig extends XyoModuleConfig = XyoModuleConfig,
  TQuery extends XyoQuery = XyoQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> implements Module<TQuery, TQueryResult>
{
  protected config?: TConfig
  protected account: XyoAccount
  protected resolver?: XyoModuleResolverFunc
  constructor(config?: TConfig, account?: XyoAccount, resolver?: (address: string) => XyoModule) {
    this.config = config
    this.account = account ?? new XyoAccount()
    this.resolver = resolver
  }

  public get address() {
    return this.account.addressValue.hex
  }

  public queryable(schema: string): boolean {
    return !!this.queries().find((item) => item === schema)
  }

  public queries(): TQuery['schema'][] {
    return [XyoModuleDiscoverQuerySchema, XyoModuleInitializeQuerySchema, XyoModuleSubscribeQuerySchema, XyoModuleShutdownQuerySchema]
  }

  public query(query: TQuery): Promisable<XyoModuleQueryResult<TQueryResult>> {
    const payloads: (TQueryResult | null)[] = []
    switch (query.schema) {
      case XyoModuleDiscoverQuerySchema: {
        this.discover()
        break
      }
      case XyoModuleInitializeQuerySchema: {
        this.initialize()
        break
      }
      case XyoModuleSubscribeQuerySchema: {
        this.subscribe()
        break
      }
      case XyoModuleShutdownQuerySchema: {
        this.shutdown()
        break
      }
    }
    return [this.bindPayloads(payloads), payloads]
  }

  discover() {
    throw new Error('Method not implemented.')
  }

  initialize() {
    throw new Error('Method not implemented.')
  }

  subscribe() {
    throw new Error('Method not implemented.')
  }

  shutdown() {
    throw new Error('Method not implemented.')
  }

  bindHashes(hashes: string[], schema: string[]) {
    return new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build()
  }

  bindPayloads(payloads: (XyoPayload | null)[]) {
    return new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()
  }
}
