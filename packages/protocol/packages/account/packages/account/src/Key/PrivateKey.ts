import { toArrayBuffer } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { Elliptic } from '@xyo-network/elliptic'
import type {
  PrivateKeyInstance, PrivateKeyStatic, PublicKeyInstance,
} from '@xyo-network/key-model'

import { EllipticKey } from './EllipticKey.ts'
import { PublicKey } from './PublicKey.ts'

@staticImplements<PrivateKeyStatic>()
export class PrivateKey extends EllipticKey implements PrivateKeyInstance {
  protected static privateConstructorKey = Date.now().toString()
  protected _isPrivateKey = true
  protected _public: PublicKeyInstance

  protected constructor(privateConstructorKey: string, value: ArrayBufferLike, publicKey: PublicKeyInstance) {
    assertEx(PrivateKey.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    super(32, value)
    this._public = publicKey
  }

  get public(): PublicKeyInstance {
    return this._public
  }

  static async create(value: ArrayBufferLike | bigint) {
    return new PrivateKey(this.privateConstructorKey, toArrayBuffer(value), await PublicKey.fromPrivate(value))
  }

  static isPrivateKey(value: unknown) {
    return (value as PrivateKey)._isPrivateKey
  }

  async sign(hash: ArrayBufferLike): Promise<ArrayBufferLike> {
    return await Elliptic.sign(hash, this.bytes)
  }

  async verify(msg: ArrayBufferLike, signature: ArrayBufferLike): Promise<boolean> {
    return await Elliptic.verify(msg, signature, this.public.address.bytes)
  }
}
