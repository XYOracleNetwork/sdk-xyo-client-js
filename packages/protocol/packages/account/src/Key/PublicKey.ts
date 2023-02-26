import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { PublicKeyModel, PublicKeyModelStatic } from '@xyo-network/key-model'

import { AddressValue } from './AddressValue'
import { EllipticKey } from './EllipticKey'

@staticImplements<PublicKeyModelStatic>()
export class PublicKey extends EllipticKey implements PublicKeyModel {
  private _isXyoPublicKey = true
  constructor(bytes: DataLike) {
    super(64, bytes)
  }

  get address() {
    return new AddressValue(this.keccak256.slice(12).toString('hex').padStart(40, '0'))
  }

  static isXyoPublicKey(value: unknown) {
    return (value as XyoPublicKey)._isXyoPublicKey
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.address.verify(msg, signature)
  }
}

export class XyoPublicKey extends PublicKey {}
