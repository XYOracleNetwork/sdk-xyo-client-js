import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

// @staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  override async sign(hash: DataLike) {
    const privateKey = this._keyPair.getPrivate('hex')
    const privateKeyBytes = toUint8Array(privateKey)
    const arrayHash = toUint8Array(hash)
    const secp256k1 = await instantiateSecp256k1()
    const a = secp256k1.signMessageHashDER(privateKeyBytes, arrayHash)
    const b = secp256k1.signMessageHashCompact(privateKeyBytes, arrayHash)
    const c = secp256k1.signMessageHashRecoverableCompact(privateKeyBytes, arrayHash)
    // const d = secp256k1.signMessageHashSchnorr(privateKeyBytes, arrayHash)
    const aPrime = secp256k1.malleateSignatureDER(a)
    const bPrime = secp256k1.malleateSignatureCompact(b)
    return bPrime
    // return toUint8Array(signature.r.toString('hex', 64) + signature.s.toString('hex', 64))
  }
}
