import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth-1-19-1'
import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { Data } from '@xyo-network/data'
import { WasmSupport } from '@xyo-network/wasm'
import { Mutex } from 'async-mutex'

const wasmSupportStatic = new WasmSupport(['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd'])
const recoveryIds = [0, 1, 2, 3] as const

function compareArrayBuffers(b1: ArrayBuffer, b2: ArrayBuffer) {
  if (b1.byteLength !== b2.byteLength) {
    return false
  }

  const a1 = new Uint8Array(b1)
  const a2 = new Uint8Array(b2)

  for (let i = 0; i < b1.byteLength; i++) {
    if (a1[1] !== a2[1]) {
      return false
    }
  }

  return true
}

export class Elliptic {
  static readonly wasmSupport = wasmSupportStatic
  protected static _secp256k1: Secp256k1 | undefined
  private static _secp256k1Mutex = new Mutex()

  static addressFromPublicKey(key: ArrayBuffer): ArrayBuffer {
    return new Data(64, key).keccak256.slice(12)
  }

  static initialize() {
    return this.secp256k1()
  }

  static async publicKeyFromPrivateKey(privateKey: ArrayBuffer, prefix = false): Promise<ArrayBuffer> {
    const { derivePublicKeyUncompressed } = await this.secp256k1()
    const fullPublicKey = derivePublicKeyUncompressed(new Uint8Array(privateKey))
    return prefix ? fullPublicKey : fullPublicKey.slice(1)
  }

  static ready() {
    return !!this._secp256k1
  }

  static async secp256k1(): Promise<Secp256k1> {
    return await this._secp256k1Mutex.runExclusive(async () => {
      if (this._secp256k1) return this._secp256k1

      await wasmSupportStatic.initialize()
      const secp256k1 = assertEx(await instantiateSecp256k1(), () => 'No Wasm Support')
      this._secp256k1 = secp256k1
      return secp256k1
    })
  }

  static async sign(hash: ArrayBuffer, key: ArrayBuffer) {
    const { signMessageHashCompact } = await this.secp256k1()
    return signMessageHashCompact(new Uint8Array(key), toUint8Array(hash))
  }

  static async verify(msg: ArrayBuffer, signature: ArrayBuffer, address: ArrayBuffer) {
    const verifier = await this.secp256k1()
    if (verifier && this.wasmSupport.canUseWasm) {
      for (const recoveryId of recoveryIds) {
        try {
          const recoveredPublicKey = verifier.recoverPublicKeyUncompressed(toUint8Array(signature), recoveryId, toUint8Array(msg)).slice(1)
          const recoveredAddress = this.addressFromPublicKey(recoveredPublicKey)
          if (compareArrayBuffers(address, recoveredAddress)) {
            return true
          }
        } catch (ex) {
          const error = ex as Error
          console.log(error.message)
          console.log(error.stack)
          continue
        }
      }
      return false
    }
    // In all failure modes default to the JS implementation
    throw new Error('No wasm support')
  }
}
