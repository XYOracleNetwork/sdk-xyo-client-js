import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyInstance, PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic.js'
import { EllipticKey } from './EllipticKey.js'
import { PublicKey } from './PublicKey.js'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected static privateConstructorKey = Date.now().toString()
  protected _isPrivateKey = true
  protected _public: PublicKeyInstance

  protected constructor(privateConstructorKey: string, value: ArrayBuffer, publicKey: PublicKeyInstance) {
    assertEx(PrivateKey.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    super(32, value)
    this._public = publicKey
  }

  get public(): PublicKeyInstance {
    return this._public
  }

  static async create(value: ArrayBuffer) {
    return new PrivateKey(this.privateConstructorKey, value, await PublicKey.fromPrivate(value))
  }

  static isPrivateKey(value: unknown) {
    return (value as PrivateKey)._isPrivateKey
  }

  async sign(hash: ArrayBuffer): Promise<ArrayBuffer> {
    return await Elliptic.sign(hash, this.bytes)
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    return await Elliptic.verify(msg, signature, this.public.address.bytes)
  }
}
