import { EmptyObject } from '@xyo-network/core'
import { XyoWitness, XyoWitnessConfigSchema } from '@xyo-network/witness'

import { XyoNonFungibleTokenPayload } from './Config'

export class XyoNonFungibleTokenWitness extends XyoWitness<XyoNonFungibleTokenPayload> {
  static schema = 'network.xyo.nft'
  override observe(_fields?: Partial<XyoNonFungibleTokenPayload>[]): Promise<XyoNonFungibleTokenPayload<EmptyObject>[]> {
    throw new Error('Method not implemented.')
  }

  static override configSchema = XyoWitnessConfigSchema
  static override targetSchema = 'network.xyo.nft'
}
