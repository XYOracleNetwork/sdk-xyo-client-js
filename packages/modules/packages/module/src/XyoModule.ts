import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoModuleDiscoverQuerySchema } from './Queries'
import { XyoQuery } from './Query'

export abstract class XyoModule<
  TConfig extends XyoModuleConfig = XyoModuleConfig,
  TQuery extends XyoQuery = XyoQuery,
  TQueryResult extends XyoPayload = XyoPayload,
> implements Module<TQuery, TQueryResult>
{
  protected config: TConfig
  protected account: XyoAccount
  constructor(config: TConfig) {
    this.config = config
    this.account = config.account ?? new XyoAccount()
  }

  public queriable(schema: string): boolean {
    return !!this.queries.find((item) => item === schema)
  }

  public abstract get queries(): string[]

  query(query: TQuery): Promisable<XyoModuleQueryResult<TQueryResult>> {
    const payloads: (TQueryResult | null)[] = []
    switch (query.schema) {
      case XyoModuleDiscoverQuerySchema: {
        this.discover()
        break
      }
    }
    return [this.bindPayloads(payloads), payloads]
  }

  discover() {
    throw new Error('Method not implemented.')
  }

  get address() {
    return this.account.addressValue.hex
  }

  get resolver() {
    return this.config.resolver
  }

  bindHashes(hashes: string[], schema: string[]) {
    return new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build()
  }

  bindPayloads(payloads: (XyoPayload | null)[]) {
    return new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()
  }
}
