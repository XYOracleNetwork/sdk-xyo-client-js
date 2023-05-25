import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PublicKeyStatic } from '@xyo-network/key-model'

import { PublicKey } from './PublicKey'

@staticImplements<PublicKeyStatic>()
export class WASMPublicKey extends PublicKey {
  private _secp256k1Instance: Promise<Secp256k1>

  constructor(bytes: DataLike) {
    super(bytes)
    this._secp256k1Instance = instantiateSecp256k1()
  }

  override async verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    const { verifySignatureCompact } = await this._secp256k1Instance
    return verifySignatureCompact(toUint8Array(signature), this.bytes, toUint8Array(msg))
  }
}
