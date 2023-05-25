import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { PublicKeyInstance, PublicKeyStatic } from '@xyo-network/key-model'

import { AddressValue } from './AddressValue'
import { EllipticKey } from './EllipticKey'

@staticImplements<PublicKeyStatic>()
export class PublicKey extends EllipticKey implements PublicKeyInstance {
  private _address?: AddressValue
  private _isXyoPublicKey = true
  constructor(bytes: DataLike) {
    super(64, bytes)
  }

  get address() {
    if (!this._address) this._address = new AddressValue(this.keccak256.slice(12).toString('hex').padStart(40, '0'))
    return this._address
  }

  static isXyoPublicKey(value: unknown) {
    return (value as PublicKey)._isXyoPublicKey
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.address.verify(msg, signature)
  }
}
