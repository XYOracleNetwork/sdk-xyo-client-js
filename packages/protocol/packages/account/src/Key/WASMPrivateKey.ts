import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  private _publicKeyBytes: Uint8Array
  private _secp256k1Instance: Promise<Secp256k1>

  constructor(value?: DataLike) {
    super(value)
    this._privateKeyBytes = toUint8Array(this._keyPair.getPrivate('hex'))
    this._publicKeyBytes = toUint8Array(this._keyPair.getPublic('hex'))
    this._secp256k1Instance = instantiateSecp256k1()
  }

  override get public(): PublicKeyInstance {
    if (!this._public) this._public = new WASMPublicKey(this._keyPair.getPublic('hex').slice(2))
    return this._public
  }

  override async sign(hash: DataLike) {
    const { malleateSignatureCompact, signMessageHashCompact } = await this._secp256k1Instance
    return signMessageHashCompact(this.bytes, toUint8Array(hash))
    // return malleateSignatureCompact(signMessageHashCompact(this.bytes, toUint8Array(hash)))
  }

  override async verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    const { verifySignatureCompact } = await this._secp256k1Instance
    return verifySignatureCompact(toUint8Array(signature), this._publicKeyBytes, toUint8Array(msg))
  }
}
