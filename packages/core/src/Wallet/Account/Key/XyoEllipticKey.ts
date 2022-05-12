import EC from 'elliptic'

import { XyoData } from './Data'

export class XyoEllipticKey extends XyoData {
  // we do this to allow node to import without problem
  // eslint-disable-next-line import/no-named-as-default-member
  protected static ecContext = new EC.ec('secp256k1')
}
