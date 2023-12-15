import { distinct } from '@xylabs/array'
import { staticImplements } from '@xylabs/static-implements'
import { KeyPairInstance, KeyPairStatic, PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'
import { WasmSupport } from '@xyo-network/wasm'

import { PrivateKey } from './PrivateKey'
import { WASMPrivateKey } from './WASMPrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

@staticImplements<KeyPairStatic>()
export class KeyPair implements KeyPairInstance {
  private static _wasmSupport = new WasmSupport([...WASMPrivateKey.wasmFeatures, ...WASMPublicKey.wasmFeatures].filter(distinct))

  private _isXyoKeyPair = true
  private _private?: PrivateKeyInstance

  constructor(privateKeyData?: ArrayBuffer) {
    this._private = new KeyPair.PrivateKeyKind(privateKeyData)
  }

  private static get PrivateKeyKind() {
    return this._wasmSupport.canUseWasm ? WASMPrivateKey : PrivateKey
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

  static async wasmInitialized() {
    if (!this._wasmSupport.isInitialized) {
      await this._wasmSupport.initialize()
    }
    return this._wasmSupport.isInitialized
  }
}
