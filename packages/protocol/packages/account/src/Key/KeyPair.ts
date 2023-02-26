import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { KeyPairModel, KeyPairModelStatic } from '@xyo-network/key-model'

import { XyoPrivateKey } from './PrivateKey'

@staticImplements<KeyPairModelStatic>()
export class KeyPair implements KeyPairModel {
  private _isXyoKeyPair = true
  private _private?: XyoPrivateKey

  constructor(privateKeyData?: DataLike) {
    this._private = new XyoPrivateKey(privateKeyData)
  }

  get private() {
    this._private = this._private ?? new XyoPrivateKey()
    return this._private
  }

  get public() {
    return this.private.public
  }

  static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }
}
