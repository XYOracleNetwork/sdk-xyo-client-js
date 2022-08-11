import { XyoAccount } from '@xyo-network/account'
import { Promisable } from '@xyo-network/archivist'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export interface XyoNode {
  attach(module: XyoDiviner): void
  remove(address: string): void
  get<T extends XyoDiviner>(address: string): T | undefined
}

export interface XyoDiviner<TQueryPayload extends XyoQueryPayload = XyoQueryPayload> {
  address: string
  divine(query: TQueryPayload): Promisable<[XyoBoundWitness, XyoPayload[]]>
}

export abstract class XyoAbstractDiviner<TQueryPayload extends XyoQueryPayload = XyoQueryPayload> implements XyoDiviner<TQueryPayload> {
  protected account: XyoAccount
  constructor(account: XyoAccount) {
    this.account = account
  }
  abstract divine(query: TQueryPayload): Promisable<[XyoBoundWitness, XyoPayload[]]>
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

export abstract class XyoAbstractTimestampDiviner<
  TQueryPayload extends XyoQueryPayload = XyoQueryPayload,
> extends XyoAbstractDiviner<TQueryPayload> {}
