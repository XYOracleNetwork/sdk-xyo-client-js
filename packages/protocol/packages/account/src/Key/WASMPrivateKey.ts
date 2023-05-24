import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

// @staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  override async sign(hash: DataLike) {
    const privateKeyBytes = toUint8Array(this._keyPair.getPrivate('hex'))
    const { malleateSignatureCompact, signMessageHashCompact } = await instantiateSecp256k1()
    const arrayHash = toUint8Array(hash)
    return malleateSignatureCompact(signMessageHashCompact(privateKeyBytes, arrayHash))
  }
}
