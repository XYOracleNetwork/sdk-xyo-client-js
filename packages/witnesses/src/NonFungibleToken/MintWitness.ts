import { Huri, XyoAddressValue, XyoDataLike, XyoPayloadWrapper, XyoQueryWitness, XyoSimpleWitness } from '@xyo-network/core'

import { XyoContractPayload, XyoNonFungibleTokenMintPayload, XyoNonFungibleTokenMintQueryPayload, XyoNonFungibleTokenPayload } from './Payload'
import { XyoNonFungibleTokenWitness } from './Witness'

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
      targetSchema: XyoNonFungibleTokenWitness.schema,
      ...query,
    })
    this.minter = new XyoAddressValue(minter)
  }
  override async observe(payload: XyoNonFungibleTokenPayload) {
    return await super.observe(payload)
  }
}
