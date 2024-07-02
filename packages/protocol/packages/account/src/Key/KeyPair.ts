import { staticImplements } from '@xylabs/static-implements'
import { KeyPairInstance, KeyPairStatic, PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'
import { randomBytes } from 'ethers'

import { WASMPrivateKey } from './WASMPrivateKey'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  private _isXyoKeyPair = true
  private _private: PrivateKeyInstance

  constructor(privateKeyData: ArrayBuffer = randomBytes(32)) {
    this._private = new WASMPrivateKey(privateKeyData)
  }

  get private(): PrivateKeyInstance {
    return this._private
  }

  get public(): PublicKeyInstance {
    return this.private.public
  }

  static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }
}
