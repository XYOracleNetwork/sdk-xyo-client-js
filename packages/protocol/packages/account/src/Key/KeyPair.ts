import { DataLike } from '@xyo-network/core'

import { XyoPrivateKey } from './PrivateKey'

export class KeyPair {
  private _isXyoKeyPair = true
  private _private?: XyoPrivateKey

  constructor(privateKeyData?: DataLike) {
    this._private = new XyoPrivateKey(privateKeyData)
  }

  public get private() {
    this._private = this._private ?? new XyoPrivateKey()
    return this._private
  }

  public get public() {
    return this.private.public
  }

  public static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }
}
