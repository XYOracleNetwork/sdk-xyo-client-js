import { XyoData } from '@xyo-network/core'
import EC from 'elliptic'

export class EllipticKey extends XyoData {
  // we do this to allow node to import without problem
  // eslint-disable-next-line import/no-named-as-default-member
  protected static ecContext = new EC.ec('secp256k1')
}
