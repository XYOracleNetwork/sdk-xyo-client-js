import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  private _privateKeyBytes: Uint8Array

  constructor(value?: DataLike) {
    super(value)
    this._privateKeyBytes = toUint8Array(this._keyPair.getPrivate('hex'))
  }

  protected get privateKeyBytes(): Uint8Array {
    return this._privateKeyBytes
  }

  override async sign(hash: DataLike) {
    const { malleateSignatureCompact, signMessageHashCompact } = await instantiateSecp256k1()
    return malleateSignatureCompact(signMessageHashCompact(this.privateKeyBytes, toUint8Array(hash)))
  }
}
