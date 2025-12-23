import type { Secp256k1 } from '@bitauth/libauth'
import { instantiateSecp256k1 } from '@bitauth/libauth'
import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx, toHex } from '@xylabs/sdk-js'
import { Data } from '@xyo-network/data'
import { WasmSupport } from '@xyo-network/wasm'
import { Mutex } from 'async-mutex'

const wasmSupportStatic = new WasmSupport(['bigInt', 'mutableGlobals', 'referenceTypes', 'saturatedFloatToInt', 'signExtensions', 'simd'])
const recoveryIds = [0, 1, 2, 3] as const

function compareArrayBuffers(b1: ArrayBufferLike, b2: ArrayBufferLike) {
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

  static addressFromPublicKey(key: ArrayBufferLike): ArrayBufferLike {
    return new Data(64, key).keccak256.slice(12)
  }

  static initialize() {
    return this.secp256k1()
  }

  static async publicKeyFromPrivateKey(privateKey: ArrayBufferLike, prefix = false): Promise<ArrayBufferLike> {
    const { derivePublicKeyUncompressed } = await this.secp256k1()
    if (BigInt(toHex(privateKey, { prefix: true })) === 0n) {
      throw new Error(`Invalid private key [${toHex(privateKey)}]`)
    }
    const derivedPublicKey = derivePublicKeyUncompressed(new Uint8Array(privateKey))
    const fullPublicKey = typeof derivedPublicKey === 'string' ? toUint8Array(derivedPublicKey) : derivedPublicKey
    return (prefix ? fullPublicKey : fullPublicKey.slice(1)).buffer
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

  static async sign(hash: ArrayBufferLike, key: ArrayBufferLike) {
    const { signMessageHashCompact } = await this.secp256k1()
    const signature = signMessageHashCompact(new Uint8Array(key), toUint8Array(hash))
    return (typeof signature === 'string' ? toUint8Array(signature) : signature).buffer
  }

  static async verify(msg: ArrayBufferLike, signature: ArrayBufferLike, address: ArrayBufferLike) {
    const verifier = await this.secp256k1()
    if (verifier && this.wasmSupport.canUseWasm) {
      for (const recoveryId of recoveryIds) {
        try {
          const rawRecoveredPublicKey = verifier.recoverPublicKeyUncompressed(toUint8Array(signature), recoveryId, toUint8Array(msg))
          const recoveredPublicKey = (typeof rawRecoveredPublicKey === 'string' ? toUint8Array(rawRecoveredPublicKey) : rawRecoveredPublicKey).slice(1).buffer
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
