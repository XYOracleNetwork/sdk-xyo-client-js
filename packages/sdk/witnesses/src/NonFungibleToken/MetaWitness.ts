import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoNonFungibleTokenMetaPayload } from './MetaPayload'

export class XyoNonFungibleTokenMetaWitness extends XyoWitness<XyoNonFungibleTokenMetaPayload> {
  override async observe(_fields?: Partial<XyoNonFungibleTokenMetaPayload>, _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>>) {
    await delay(0)
    return { address: '', schema: 'network.xyo.nft.meta' }
  }
}
