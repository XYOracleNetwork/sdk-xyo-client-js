import { XyoAddressValue } from '@xyo-network/account'
import { EmptyObject, XyoDataLike } from '@xyo-network/core'
import { Huri, PayloadWrapper } from '@xyo-network/payload'
import { XyoWitness } from '@xyo-network/witness'

import { XyoContractPayload, XyoNonFungibleTokenPayload, XyoNonFungibleTokenWitnessConfig } from './Config'

export class XyoSmartContractWrapper<T extends XyoContractPayload> extends PayloadWrapper<T> {
  public static override async load(address: XyoDataLike | Huri) {
    const payload = await new Huri<XyoContractPayload>(address).fetch()
    return payload ? new XyoSmartContractWrapper(payload) : null
  }
}

/** @description Witness that will sign a new NFT being minted if it follows the terms */
export class XyoNonFungibleTokenMintWitness extends XyoWitness<XyoNonFungibleTokenPayload, XyoNonFungibleTokenWitnessConfig> {
  protected minter: XyoAddressValue
  constructor(config: XyoNonFungibleTokenWitnessConfig, minter: XyoDataLike) {
    super(config)
    this.minter = new XyoAddressValue(minter)
  }

  override observe(_fields: Partial<XyoNonFungibleTokenPayload>[]): Promise<XyoNonFungibleTokenPayload<EmptyObject>[]> {
    throw new Error('Method not implemented.')
  }
}
