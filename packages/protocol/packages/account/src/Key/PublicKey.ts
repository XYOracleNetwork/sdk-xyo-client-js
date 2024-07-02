import { toUint8Array } from '@xylabs/arraybuffer'
import { staticImplements } from '@xylabs/static-implements'
import { PublicKeyInstance, PublicKeyStatic } from '@xyo-network/key-model'

import { AddressValue } from './AddressValue'
import { EllipticKey } from './EllipticKey'

@staticImplements<PublicKeyStatic>()
export class PublicKey extends EllipticKey implements PublicKeyInstance {
  private _address?: AddressValue
  private _isPublicKey = true
  constructor(bytes: ArrayBuffer) {
    super(64, bytes)
  }

  get address() {
    if (!this._address) this._address = new AddressValue(toUint8Array(this.keccak256.slice(12)))
    return this._address
  }

  static isPublicKey(value: unknown) {
    return (value as PublicKey)._isPublicKey
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    return await this.address.verify(msg, signature)
  }
}
