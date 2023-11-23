import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array } from '@xyo-network/core'
import { PublicKeyInstance, PublicKeyStatic } from '@xyo-network/key-model'

import { AddressValue } from './AddressValue'
import { EllipticKey } from './EllipticKey'

@staticImplements<PublicKeyStatic>()
export class PublicKey extends EllipticKey implements PublicKeyInstance {
  private _address?: AddressValue
  private _isPublicKey = true
  constructor(bytes: DataLike) {
    super(64, bytes)
  }

  get address() {
    if (!this._address) this._address = new AddressValue(toUint8Array(this.keccak256.slice(12).toString('hex').padStart(40, '0')))
    return this._address
  }

  static isPublicKey(value: unknown) {
    return (value as PublicKey)._isPublicKey
  }

  verify(msg: ArrayBuffer, signature: ArrayBuffer): boolean | Promise<boolean> {
    return this.address.verify(msg, signature)
  }
}
