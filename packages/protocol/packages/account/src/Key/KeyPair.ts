import { staticImplements } from '@xylabs/static-implements'
import { DataLike } from '@xyo-network/core'
import { KeyPairInstance, KeyPairStatic, PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'
import { WASMPrivateKey } from './WASMPrivateKey'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  static allowWasm = false
  static wasmSupported = true

  private _isXyoKeyPair = true
  private _private?: PrivateKeyInstance

  constructor(privateKeyData?: DataLike) {
    this._private = new KeyPair.PrivateKeyKind(privateKeyData)
  }

  private static get PrivateKeyKind() {
    return KeyPair.allowWasm && KeyPair.wasmSupported ? WASMPrivateKey : PrivateKey
  }

  get private(): PrivateKeyInstance {
    this._private = this._private ?? new KeyPair.PrivateKeyKind()
    return this._private
  }

  get public(): PublicKeyInstance {
    return this.private.public
  }

  static isXyoKeyPair(value: unknown) {
    return (value as KeyPair)._isXyoKeyPair
  }
}
