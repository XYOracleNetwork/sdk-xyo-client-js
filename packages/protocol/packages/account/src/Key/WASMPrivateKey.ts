import { toUint8Array } from '@xylabs/arraybuffer'
import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'
import { WasmFeature, WasmSupport } from '@xyo-network/wasm'

import { PrivateKey } from './PrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  static readonly wasmFeatures: WasmFeature[] = ['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd']
  private static _secp256k1Instance?: Secp256k1
  private static _wasmSupport = new WasmSupport(WASMPrivateKey.wasmFeatures)

  private _publicKeyBytes: ArrayBuffer

  constructor(value: ArrayBuffer) {
    super(value)
    const publicHex = this._keyPair.getPublic('hex')
    this._publicKeyBytes = toUint8Array(publicHex, value?.byteLength)
  }

  override get public(): PublicKeyInstance {
    if (!this._public) this._public = new WASMPublicKey(toUint8Array(this._keyPair.getPublic('hex').slice(2)))
    return this._public
  }

  static async getSecp256k1() {
    await WASMPrivateKey.wasmInitialized()
    this._secp256k1Instance = this._secp256k1Instance ?? (await instantiateSecp256k1())
    return this._secp256k1Instance
  }

  static async wasmInitialized() {
    if (!this._wasmSupport.isInitialized) {
      await this._wasmSupport.initialize()
    }
    return this._wasmSupport.isInitialized
  }

  override async sign(hash: ArrayBuffer) {
    // const { malleateSignatureCompact, signMessageHashCompact } = await this._secp256k1Instance
    // return malleateSignatureCompact(signMessageHashCompact(this.bytes, toUint8Array(hash)))

    const { signMessageHashCompact } = await WASMPrivateKey.getSecp256k1()
    return signMessageHashCompact(toUint8Array(this.bytes), toUint8Array(hash))
  }

  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    await WASMPrivateKey.wasmInitialized()

    const { verifySignatureCompact } = await WASMPrivateKey.getSecp256k1()
    return verifySignatureCompact(toUint8Array(signature), toUint8Array(this._publicKeyBytes), toUint8Array(msg))
  }
}
