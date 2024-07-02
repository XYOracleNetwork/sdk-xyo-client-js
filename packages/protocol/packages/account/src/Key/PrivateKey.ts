import { toUint8Array } from '@xylabs/arraybuffer'
import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyInstance, PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'
import EC from 'elliptic'

import { Elliptic } from '../Elliptic'
import { EllipticKey } from './EllipticKey'
import { PublicKey } from './PublicKey'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected _isPrivateKey = true
  protected _keyPair: EC.ec.KeyPair
  protected _public?: PublicKeyInstance

  constructor(value?: ArrayBuffer) {
    const keyPair =
      value ?
        PrivateKey.ecContext.keyFromPrivate(toUint8Array(value, 32), 'array')
      : (() => {
          try {
            return PrivateKey.ecContext.genKeyPair()
          } catch {
            //this catch is for the few browsers that do not have crypto random
            return PrivateKey.ecContext.keyFromPrivate(Math.floor(Math.random() * 999_999_999_999).toString())
          }
        })()
    super(32, toUint8Array(keyPair.getPrivate('hex'), 32))
    this._keyPair = keyPair
  }

  get public(): PublicKeyInstance {
    this._public = this._public ?? new PublicKey(toUint8Array(this._keyPair.getPublic('hex').slice(2)))
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

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    return await Elliptic.verify(msg, signature, this.public.address.bytes)
  }
}
