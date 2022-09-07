import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModuleConfig } from './Config'
import { Module, XyoModuleQueryResult } from './Module'
import { XyoQuery } from './Query'

export abstract class XyoModule<TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module {
  protected config: TConfig
  constructor(config: TConfig) {
    this.config = config
  }

  public queriable(schema: string): boolean {
    return !!this.queries.find((item) => item === schema)
  }

  public abstract get queries(): string[]

  abstract query(query: XyoQuery): Promisable<XyoModuleQueryResult>

  get account() {
    return this.config.account
  }

  get address() {
    return this.account.addressValue.hex
  }

  bindHashes(hashes: string[], schema: string[]) {
    return new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build()
  }

  bindPayloads(payloads: (XyoPayload | null)[]) {
    return new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()
  }
}
