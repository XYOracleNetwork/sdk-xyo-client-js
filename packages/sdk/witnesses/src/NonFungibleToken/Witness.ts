import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends XyoWitness<XyoNonFungibleTokenPayload> {
  override observe(
    _fields?: Partial<XyoNonFungibleTokenPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoNonFungibleTokenPayload<EmptyObject>> {
    throw new Error('Method not implemented.')
  }
  static schema = 'network.xyo.nft'
}
