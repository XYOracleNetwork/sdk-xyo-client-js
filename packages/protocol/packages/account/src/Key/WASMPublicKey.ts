import { staticImplements } from '@xylabs/static-implements'
import { PublicKeyStatic } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic'
import { PublicKey } from './PublicKey'

@staticImplements<PublicKeyStatic>()
export class WASMPublicKey extends PublicKey {
  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    return await Elliptic.verify(msg, signature, this.address.bytes)
  }
}
