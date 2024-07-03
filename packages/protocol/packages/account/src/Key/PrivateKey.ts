import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyInstance, PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic'
import { EllipticKey } from './EllipticKey'
import { PublicKey } from './PublicKey'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected _isPrivateKey = true
  protected _public?: PublicKeyInstance

  constructor(value: ArrayBuffer) {
    super(32, value)
  }

  static isPrivateKey(value: unknown) {
    return (value as PrivateKey)._isPrivateKey
  }

  async getPublic(): Promise<PublicKeyInstance> {
    this._public = this._public ?? new PublicKey(await Elliptic.publicKeyFromPrivateKey(this.bytes))
    return this._public
  }

  async sign(hash: ArrayBuffer): Promise<ArrayBuffer> {
    return await Elliptic.sign(hash, this.bytes)
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    return await Elliptic.verify(msg, signature, (await this.getPublic()).address.bytes)
  }
}
