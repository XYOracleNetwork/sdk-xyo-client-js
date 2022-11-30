import { DataLike, toUint8Array } from '@xyo-network/core'
import EC from 'elliptic'

import { EllipticKey } from './EllipticKey'
import { XyoPublicKey } from './PublicKey'

export class PrivateKey extends EllipticKey {
  private _isXyoPrivateKey = true
  private _keyPair: EC.ec.KeyPair
  private _public?: XyoPublicKey

  constructor(value?: DataLike) {
    super(32)
    if (value) {
      this._keyPair = XyoPrivateKey.ecContext.keyFromPrivate(toUint8Array(value), 'array')
    } else {
      try {
        this._keyPair = XyoPrivateKey.ecContext.genKeyPair()
      } catch {
        //this catch is for the few browsers that do not have crypto random
        this._keyPair = XyoPrivateKey.ecContext.keyFromPrivate(Math.floor(Math.random() * 999999999999).toString())
        console.warn('XyoAccount created without browser crypto')
      }
    }
  }

  public override get bytes() {
    return toUint8Array(this._keyPair?.getPrivate('hex'))
  }

  public get public() {
    this._public = this._public ?? new XyoPublicKey(this._keyPair.getPublic('hex').slice(2))
    return this._public
  }

  public static isXyoPrivateKey(value: unknown) {
    return (value as XyoPrivateKey)._isXyoPrivateKey
  }

  public sign(hash: DataLike) {
    const arrayHash = toUint8Array(hash)
    const signature = this._keyPair.sign(arrayHash)
    return toUint8Array(signature.r.toString('hex', 64) + signature.s.toString('hex', 64))
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }

  /*
  public signKeccakMessage(message: string) {
    const prefixBuffer = Buffer.from(messagePrefix)
    const messageLengthBuffer = Buffer.from([0x20])
    const messageBuffer = Buffer.from(message)
    const signingBuffer = keccak256(
      Buffer.concat([
        prefixBuffer,
        messageLengthBuffer,
        keccak256(Buffer.concat([messageBuffer, Buffer.from(toUint8Array(this.address))])),
      ])
    )
    const signature = this._key.sign(signingBuffer)
    return signature.toDER('hex').substring(2)
  }
  */
}

export class XyoPrivateKey extends PrivateKey {}
