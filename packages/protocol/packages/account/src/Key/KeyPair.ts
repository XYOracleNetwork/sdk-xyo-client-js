import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { KeyPairInstance, KeyPairStatic } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  private _isXyoKeyPair = true
  private _private?: PrivateKey

  constructor(privateKeyData?: DataLike) {
    this._private = new PrivateKey(privateKeyData)
  }

  get private() {
    this._private = this._private ?? new PrivateKey()
    return this._private
  }

  get public() {
    return this.private.public
  }

  static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }
}
