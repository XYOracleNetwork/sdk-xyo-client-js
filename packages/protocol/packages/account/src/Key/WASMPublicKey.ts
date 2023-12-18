import { toUint8Array } from '@xylabs/arraybuffer'
import { instantiateSecp256k1, Secp256k1 } from '@xylabs/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { PublicKeyStatic } from '@xyo-network/key-model'
import { WasmFeature, WasmSupport } from '@xyo-network/wasm'

import { PublicKey } from './PublicKey'

@staticImplements<PublicKeyStatic>()
export class WASMPublicKey extends PublicKey {
  static readonly wasmFeatures: WasmFeature[] = ['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd']
  private static _secp256k1Instance?: Secp256k1
  private static _wasmSupport = new WasmSupport(WASMPublicKey.wasmFeatures)

  static async getSecp256k1() {
    await WASMPublicKey.wasmInitialized()
    this._secp256k1Instance = this._secp256k1Instance ?? (await instantiateSecp256k1())
    return this._secp256k1Instance
  }

  static async wasmInitialized() {
    if (!this._wasmSupport.isInitialized) {
      await this._wasmSupport.initialize()
    }
    return this._wasmSupport.isInitialized
  }

  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    const { verifySignatureCompact } = await WASMPublicKey.getSecp256k1()
    return verifySignatureCompact(toUint8Array(signature), new Uint8Array(this.bytes), toUint8Array(msg))
  }
}
