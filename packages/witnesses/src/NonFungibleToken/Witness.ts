import { XyoSimpleWitness } from '../Witness'
import { XyoNonFungibleTokenPayload } from './Payload'

export class XyoNonFungibleTokenWitness extends XyoSimpleWitness<XyoNonFungibleTokenPayload> {
  static schema = 'network.xyo.nft'
}
