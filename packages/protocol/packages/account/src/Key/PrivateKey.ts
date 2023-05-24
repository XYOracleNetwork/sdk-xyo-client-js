import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PrivateKeyInstance, PrivateKeyStatic } from '@xyo-network/key-model'
import EC from 'elliptic'

import { EllipticKey } from './EllipticKey'
import { XyoPublicKey } from './PublicKey'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected _isXyoPrivateKey = true
  protected _keyPair: EC.ec.KeyPair
  protected _public?: XyoPublicKey

  constructor(value?: DataLike) {
    super(32)
    if (value) {
      this._keyPair = PrivateKey.ecContext.keyFromPrivate(toUint8Array(value), 'array')
    } else {
      try {
        this._keyPair = PrivateKey.ecContext.genKeyPair()
      } catch {
        //this catch is for the few browsers that do not have crypto random
        this._keyPair = PrivateKey.ecContext.keyFromPrivate(Math.floor(Math.random() * 999999999999).toString())
        console.warn('XyoAccount created without browser crypto')
      }
    }
  }

  override get bytes() {
    return toUint8Array(this._keyPair?.getPrivate('hex'))
  }

  get public() {
    this._public = this._public ?? new XyoPublicKey(this._keyPair.getPublic('hex').slice(2))
    return this._public
  }

  static isXyoPrivateKey(value: unknown) {
    return (value as PrivateKey)._isXyoPrivateKey
  }

  sign(hash: DataLike): Uint8Array | Promise<Uint8Array> {
    const arrayHash = toUint8Array(hash)
    const signature = this._keyPair.sign(arrayHash)
    return toUint8Array(signature.r.toString('hex', 64) + signature.s.toString('hex', 64))
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean | Promise<boolean> {
    return this.public.address.verify(msg, signature)
  }
}
