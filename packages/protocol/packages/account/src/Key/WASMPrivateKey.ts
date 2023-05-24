import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  private _privateKeyBytes: Uint8Array
  private _publicKeyBytes: Uint8Array
  private _secp256k1Instance: Promise<Secp256k1>

  constructor(value?: DataLike) {
    super(value)
    this._privateKeyBytes = toUint8Array(this._keyPair.getPrivate('hex'))
    this._publicKeyBytes = toUint8Array(this._keyPair.getPublic('hex'))
    this._secp256k1Instance = instantiateSecp256k1()
  }

  override async sign(hash: DataLike) {
    const { malleateSignatureCompact, signMessageHashCompact } = await this._secp256k1Instance
    return malleateSignatureCompact(signMessageHashCompact(this._privateKeyBytes, toUint8Array(hash)))
  }

  override async verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    const { verifySignatureCompact } = await this._secp256k1Instance
    return verifySignatureCompact(toUint8Array(signature), this._publicKeyBytes, toUint8Array(msg))
  }
}
