import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { KeyPairInstance, KeyPairStatic } from '@xyo-network/key-model'

import { XyoPrivateKey } from './PrivateKey'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
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
