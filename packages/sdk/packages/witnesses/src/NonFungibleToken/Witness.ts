import { EmptyObject } from '@xyo-network/core'
import { XyoWitness } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends XyoWitness<XyoNonFungibleTokenPayload> {
  override observe(_fields?: Partial<XyoNonFungibleTokenPayload>): Promise<XyoNonFungibleTokenPayload<EmptyObject>> {
    throw new Error('Method not implemented.')
  }
  static schema = 'network.xyo.nft'
}
