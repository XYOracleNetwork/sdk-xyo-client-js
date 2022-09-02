import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { Module, XyoModuleQueryResult } from './Module'
import { XyoQueryPayload } from './Query'

export type XyoModuleConfigSchema = 'network.xyo.module.config'
export const XyoModuleConfigSchema: XyoModuleConfigSchema = 'network.xyo.module.config'

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload> = XyoPayload<
  TConfig & {
    account: XyoAccount
    resolver?: (address: string) => XyoModule
  },
  TConfig['schema']
>

export abstract class XyoModule<TConfig extends XyoModuleConfig = XyoModuleConfig> implements Module {
  protected config: TConfig
  constructor(config: TConfig) {
    this.config = config
  }

  public queriable(schema: string): boolean {
    return !!this.queries.find((item) => item === schema)
  }

  public abstract get queries(): string[]

  abstract query(query: XyoQueryPayload): Promisable<XyoModuleQueryResult>

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
