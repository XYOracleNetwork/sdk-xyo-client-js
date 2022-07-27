import { XyoAddressValue } from '@xyo-network/account'
import { XyoDataLike } from '@xyo-network/core'
import { Huri, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoQueryWitness, XyoQueryWitnessConfig, XyoSimpleWitness } from '../Witness'
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
export class XyoNonFungibleTokenMintQuery extends XyoQueryWitness<
  XyoNonFungibleTokenPayload,
  XyoNonFungibleTokenMintQueryPayload,
  XyoQueryWitnessConfig<XyoNonFungibleTokenMintQueryPayload>
> {
  protected minter: XyoAddressValue
  constructor(config: XyoQueryWitnessConfig<XyoNonFungibleTokenMintQueryPayload>, minter: XyoDataLike) {
    super(config)
    this.minter = new XyoAddressValue(minter)
  }
  override async observe(fields?: Partial<XyoNonFungibleTokenPayload>) {
    return await super.observe(fields)
  }
}
