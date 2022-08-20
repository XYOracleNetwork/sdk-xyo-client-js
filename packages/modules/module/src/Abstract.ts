import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModule, XyoModuleQueryResult } from './Module'

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload, TQuery extends XyoQueryPayload = XyoQueryPayload> = XyoPayload<
  TConfig & {
    account: XyoAccount
    resolver?: (address: string) => XyoModule<TQuery>
  }
>

export abstract class XyoAbstractModule<TConfig extends XyoPayload = XyoPayload, TQuery extends XyoQueryPayload = XyoQueryPayload>
  implements XyoModule<TQuery>
{
  protected config: XyoModuleConfig<TConfig, TQuery>
  constructor(config: XyoModuleConfig<TConfig, TQuery>) {
    this.config = config
  }

  public queriable(schema: string): boolean {
    return !!this.queries.find((item) => item === schema)
  }

  public abstract get queries(): string[]

  abstract query(query: TQuery): Promisable<XyoModuleQueryResult>

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
