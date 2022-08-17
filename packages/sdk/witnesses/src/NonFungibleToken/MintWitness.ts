import { XyoAddressValue } from '@xyo-network/account'
import { EmptyObject, XyoDataLike } from '@xyo-network/core'
import { Huri, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoContractPayload, XyoNonFungibleTokenPayload, XyoNonFungibleTokenQueryPayload } from './Payload'

export class XyoSmartContractWrapper<T extends XyoContractPayload> extends XyoPayloadWrapper<T> {
  public static async load(address: XyoDataLike | Huri) {
    const payload = await new Huri<XyoContractPayload>(address).fetch()
    if (payload) {
      return new XyoSmartContractWrapper(payload)
    }
  }
}

/** @description Witness that will sign a new NFT being minted if it follows the terms */
export class XyoNonFungibleTokenMintWitness extends XyoWitness<
  XyoNonFungibleTokenPayload,
  XyoNonFungibleTokenQueryPayload,
  XyoWitnessConfig<XyoNonFungibleTokenQueryPayload>
> {
  protected minter: XyoAddressValue
  constructor(config: XyoWitnessConfig<XyoNonFungibleTokenQueryPayload>, minter: XyoDataLike) {
    super(config)
    this.minter = new XyoAddressValue(minter)
  }

  override observe(
    _fields: Partial<XyoNonFungibleTokenPayload>,
    _query?: XyoNonFungibleTokenQueryPayload | undefined,
  ): Promise<XyoNonFungibleTokenPayload<EmptyObject>> {
    throw new Error('Method not implemented.')
  }
}
