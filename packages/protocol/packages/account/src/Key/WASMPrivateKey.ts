import { toUint8Array } from '@xylabs/arraybuffer'
import { instantiateSecp256k1, Secp256k1 } from '@xylabs/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { PrivateKeyStatic, PublicKeyInstance } from '@xyo-network/key-model'
import { WasmFeature, WasmSupport } from '@xyo-network/wasm'

import { PrivateKey } from './PrivateKey'
import { WASMPublicKey } from './WASMPublicKey'

@staticImplements<PrivateKeyStatic>()
export class WASMPrivateKey extends PrivateKey {
  static readonly wasmFeatures: WasmFeature[] = ['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd']
  private static _wasmSupport = new WasmSupport(WASMPrivateKey.wasmFeatures)

  private _publicKeyBytes: ArrayBuffer
  private _secp256k1Instance: Promise<Secp256k1>

  constructor(value?: ArrayBuffer) {
    super(value)
    const privateHex = this._keyPair.getPrivate('hex')
    this._privateKeyBytes = toUint8Array(privateHex)
    const publicHex = this._keyPair.getPublic('hex')
    this._publicKeyBytes = toUint8Array(publicHex)
    this._secp256k1Instance = instantiateSecp256k1()
  }

  override get public(): PublicKeyInstance {
    if (!this._public) this._public = new WASMPublicKey(toUint8Array(this._keyPair.getPublic('hex').slice(2)))
    return this._public
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
    await WASMPrivateKey.wasmInitialized()

    const { signMessageHashCompact } = await this._secp256k1Instance
    return signMessageHashCompact(this.bytes, toUint8Array(hash))
  }

  override async verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    await WASMPrivateKey.wasmInitialized()

    const { verifySignatureCompact } = await this._secp256k1Instance
    return verifySignatureCompact(toUint8Array(signature), toUint8Array(this._publicKeyBytes), toUint8Array(msg))
  }
}
