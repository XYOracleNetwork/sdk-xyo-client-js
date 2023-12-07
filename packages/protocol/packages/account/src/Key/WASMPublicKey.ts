import { toUint8Array } from '@xylabs/arraybuffer'
import { instantiateSecp256k1, Secp256k1 } from '@xylabs/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { PublicKeyStatic } from '@xyo-network/key-model'
import { WasmFeature } from '@xyo-network/wasm'

import { PublicKey } from './PublicKey'

@staticImplements<PublicKeyStatic>()
export class WASMPublicKey extends PublicKey {
  static readonly wasmFeatures: WasmFeature[] = ['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd']

  private _secp256k1Instance: Promise<Secp256k1>

  constructor(bytes: ArrayBuffer) {
    super(bytes)
    this._secp256k1Instance = instantiateSecp256k1()
  }

  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    const { verifySignatureCompact } = await this._secp256k1Instance
    return verifySignatureCompact(toUint8Array(signature), new Uint8Array(this.bytes), toUint8Array(msg))
  }
}
