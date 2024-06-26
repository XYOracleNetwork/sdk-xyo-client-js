import { Data } from '@xyo-network/data'
import EC from 'elliptic'

export class EllipticKey extends Data {
  // we do this to allow node to import without problem

  protected static ecContext = new EC.ec('secp256k1')
}
