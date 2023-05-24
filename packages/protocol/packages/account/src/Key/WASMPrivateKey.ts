import { instantiateSecp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

// @staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  override async sign(hash: DataLike) {
    const arrayHash = toUint8Array(hash)
    const secp256k1 = await instantiateSecp256k1()
    return secp256k1.signMessageHashDER(arrayHash, this.bytes)
    // return toUint8Array(signature.r.toString('hex', 64) + signature.s.toString('hex', 64))
  }
}

export class XyoPrivateKey extends PrivateKey {}
