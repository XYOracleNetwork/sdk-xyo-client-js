import { XyoDataLike } from '@xyo-network/core'

import { XyoPrivateKey } from './XyoPrivateKey'

export class XyoKeyPair {
  private _isXyoKeyPair = true
  private _private?: XyoPrivateKey

  constructor(privateKeyData?: XyoDataLike) {
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
    return (value as XyoKeyPair)._isXyoKeyPair
  }
}
