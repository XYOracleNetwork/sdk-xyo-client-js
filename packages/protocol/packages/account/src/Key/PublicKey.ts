import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { AddressValueInstance, PublicKeyInstance, PublicKeyStatic } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic.js'
import { AddressValue } from './AddressValue.js'
import { EllipticKey } from './EllipticKey.js'

@staticImplements<PublicKeyStatic>()
export class PublicKey extends EllipticKey implements PublicKeyInstance {
  protected static privateConstructorKey = Date.now().toString()
  private _address: AddressValueInstance
  private _isPublicKey = true

  protected constructor(privateConstructorKey: string, bytes: ArrayBuffer) {
    assertEx(PublicKey.privateConstructorKey === privateConstructorKey, () => 'Use create function instead of constructor')
    super(64, bytes)
    const address = Elliptic.addressFromPublicKey(bytes)
    const addressValue = new AddressValue(address)
    this._address = addressValue
  }

  get address() {
    return this._address
  }

  static async create(bytes: ArrayBuffer) {
    return await Promise.resolve(new PublicKey(this.privateConstructorKey, bytes))
  }

  static async fromPrivate(bytes: ArrayBuffer): Promise<PublicKeyInstance> {
    const publicKey = await Elliptic.publicKeyFromPrivateKey(bytes)
    return new PublicKey(this.privateConstructorKey, publicKey)
  }

  static isPublicKey(value: unknown) {
    return (value as PublicKey)._isPublicKey
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    return await Elliptic.verify(msg, signature, this.address.bytes)
  }
}
