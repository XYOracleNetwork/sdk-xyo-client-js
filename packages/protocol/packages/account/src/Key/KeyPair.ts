import { distinct } from '@xylabs/array'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, WasmSupport } from '@xyo-network/core'
import { KeyPairInstance, KeyPairStatic, PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'

import { PrivateKey } from './PrivateKey'
import { WASMPrivateKey } from './WASMPrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

const wasmSupportStatic = new WasmSupport([...WASMPrivateKey.wasmFeatures, ...WASMPublicKey.wasmFeatures].filter(distinct))

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  static readonly wasmInitialized = wasmSupportStatic.initialize()
  static readonly wasmSupport = wasmSupportStatic

  private _isXyoKeyPair = true
  private _private?: PrivateKeyInstance

  constructor(privateKeyData?: DataLike) {
    this._private = new KeyPair.PrivateKeyKind(privateKeyData)
  }

  private static get PrivateKeyKind() {
    return KeyPair.wasmSupport.canUseWasm ? WASMPrivateKey : PrivateKey
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
