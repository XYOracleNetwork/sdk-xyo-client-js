import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModule } from './Module'

export type XyoModuleConfig<T extends XyoPayload = XyoPayload, M extends XyoModule = XyoModule> = {
  account: XyoAccount
  resolver?: (address: string) => M
} & T

export abstract class XyoAbstractModule<Q extends XyoQueryPayload = XyoQueryPayload, C extends XyoModuleConfig = XyoModuleConfig>
  implements XyoModule<Q>
{
  protected config: C
  constructor(config: C) {
    this.config = config
  }
  abstract query(query: Q): Promisable<[XyoBoundWitness, XyoPayload[]]>

  get account() {
    return this.config.account
  }

  get address() {
    return this.account.addressValue.hex
  }

  bindHashes(hashes: string[], schema: string[]) {
    return new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build()
  }

  bindPayloads(payloads: XyoPayload[]) {
    return new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()
  }
}
