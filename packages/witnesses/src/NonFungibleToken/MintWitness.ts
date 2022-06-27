import { XyoAddressValue } from '@xyo-network/account'
import { XyoDataLike } from '@xyo-network/core'
import { Huri, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoQueryWitness, XyoSimpleWitness } from '../Witness'
import { XyoContractPayload, XyoNonFungibleTokenMintPayload, XyoNonFungibleTokenMintQueryPayload, XyoNonFungibleTokenPayload } from './Payload'

export class XyoSmartContractWrapper<T extends XyoContractPayload> extends XyoPayloadWrapper<T> {
  public static async load(address: XyoDataLike | Huri) {
    const payload = await new Huri(address).fetch()
    if (payload) {
      return new XyoSmartContractWrapper(payload)
    }
  }
}

export class XyoNonFungibleTokenMintWitness extends XyoSimpleWitness<XyoNonFungibleTokenMintPayload> {
  static schema = 'network.xyo.nft.mint'
}

/** @description Witness that will sign a new NFT being minted if it follows the terms */
export class XyoNonFungibleTokenMintQuery extends XyoQueryWitness<XyoNonFungibleTokenMintQueryPayload, XyoNonFungibleTokenPayload> {
  protected minter: XyoAddressValue
  constructor(query: XyoNonFungibleTokenMintQueryPayload, minter: XyoDataLike) {
    super({
      targetSchema: XyoNonFungibleTokenMintWitness.schema,
      ...query,
    })
    this.minter = new XyoAddressValue(minter)
  }
  override async observe(payload: XyoNonFungibleTokenPayload) {
    return await super.observe(payload)
  }
}
