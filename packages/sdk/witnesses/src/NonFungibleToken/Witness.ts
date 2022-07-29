import { XyoSimpleWitness } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Payload'

export class XyoNonFungibleTokenWitness extends XyoSimpleWitness<XyoNonFungibleTokenPayload> {
  static schema = 'network.xyo.nft'
}
