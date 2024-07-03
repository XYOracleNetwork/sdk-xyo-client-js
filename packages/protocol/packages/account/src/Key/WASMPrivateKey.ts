import { toUint8Array } from '@xylabs/arraybuffer'
import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic'
import { PrivateKey } from './PrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  private _publicKeyBytes: ArrayBuffer

  constructor(value: ArrayBuffer) {
    super(value)
    const publicHex = this._keyPair.getPublic('hex')
    this._publicKeyBytes = toUint8Array(publicHex, value?.byteLength)
  }

  override get public(): PublicKeyInstance {
    if (!this._public) this._public = new WASMPublicKey(toUint8Array(this._keyPair.getPublic('hex').slice(2)))
    return this._public
  }

  override async sign(hash: ArrayBuffer) {
    return await Elliptic.sign(hash, this.bytes)
  }

  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    return await Elliptic.verify(msg, signature, this.public.address.bytes)
  }
}
