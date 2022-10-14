import { delay } from '@xylabs/delay'
import { XyoWitness } from '@xyo-network/witness'

import { XyoNonFungibleTokenMetaPayload } from './MetaPayload'

export class XyoNonFungibleTokenMetaWitness extends XyoWitness<XyoNonFungibleTokenMetaPayload> {
  override async observe(_fields?: Partial<XyoNonFungibleTokenMetaPayload>[]) {
    await delay(0)
    return [{ address: '', schema: 'network.xyo.nft.meta' }]
  }
}
