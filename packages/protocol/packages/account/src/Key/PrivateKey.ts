import { staticImplements } from '@xylabs/static-implements'
import { toUint8Array } from '@xyo-network/core'
import { PrivateKeyInstance, PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'
import EC from 'elliptic'

import { EllipticKey } from './EllipticKey'
import { PublicKey } from './PublicKey'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected _isPrivateKey = true
  protected _keyPair: EC.ec.KeyPair
  protected _privateKeyBytes: Uint8Array
  protected _public?: PublicKeyInstance

  constructor(value?: ArrayBuffer) {
    super(32)
    if (value) {
      this._keyPair = PrivateKey.ecContext.keyFromPrivate(toUint8Array(value), 'array')
    } else {
      try {
        this._keyPair = PrivateKey.ecContext.genKeyPair()
      } catch {
        //this catch is for the few browsers that do not have crypto random
        this._keyPair = PrivateKey.ecContext.keyFromPrivate(Math.floor(Math.random() * 999999999999).toString())
        console.warn('Account created without browser crypto')
      }
    }
    this._privateKeyBytes = toUint8Array(this._keyPair.getPrivate('hex'))
  }

  override get bytes() {
    return this._privateKeyBytes
  }

  get public(): PublicKeyInstance {
    if (!this._public) this._public = new PublicKey(this._keyPair.getPublic('hex').slice(2))
    return this._public
  }

  static isPrivateKey(value: unknown) {
    return (value as PrivateKey)._isPrivateKey
  }

  sign(hash: ArrayBuffer): ArrayBuffer | Promise<ArrayBuffer> {
    const arrayHash = toUint8Array(hash)
    const signature = this._keyPair.sign(arrayHash)
    return toUint8Array(signature.r.toString('hex', 64) + signature.s.toString('hex', 64))
  }

  verify(msg: ArrayBuffer, signature: ArrayBuffer): boolean | Promise<boolean> {
    return this.public.address.verify(msg, signature)
  }
}
