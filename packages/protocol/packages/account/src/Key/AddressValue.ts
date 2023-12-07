import { equalArrayBuffers, toUint8Array } from '@xylabs/arraybuffer'
import { instantiateSecp256k1, Secp256k1 } from '@xylabs/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { Data } from '@xyo-network/data'
import { AddressValueInstance, AddressValueStatic } from '@xyo-network/key-model'
import { WasmSupport } from '@xyo-network/wasm'

import { EllipticKey } from './EllipticKey'

const wasmSupportStatic = new WasmSupport(['bigInt'])
const recoveryIds = [0, 1, 2, 3] as const

@staticImplements<AddressValueStatic>()
export class AddressValue extends EllipticKey implements AddressValueInstance {
  static readonly wasmSupport = wasmSupportStatic
  protected static _secp256k1: Promise<Secp256k1 | null>

  private _isAddress = true
  constructor(address: ArrayBuffer) {
    super(20, AddressValue.addressFromAddressOrPublicKey(address))
  }

  static addressFromAddressOrPublicKey(bytes: ArrayBuffer) {
    return bytes.byteLength === 20 ? bytes : AddressValue.addressFromPublicKey(bytes)
  }

  static addressFromPublicKey(key: ArrayBuffer): ArrayBuffer {
    return new Data(64, key).keccak256.slice(12)
  }

  static isAddress(value: unknown) {
    return (value as AddressValue)._isAddress
  }

  //there has to be a better way to do this other than trying all four numbers
  //maybe we can get the number from the address more easily
  static verify(msg: ArrayBuffer, signature: ArrayBuffer, address: ArrayBuffer) {
    let valid = false
    const sigArray = toUint8Array(signature)
    const r = sigArray.slice(0, 32)
    const s = sigArray.slice(32, 64)

    const expectedAddress = new AddressValue(address).bytes
    for (const recoveryId of recoveryIds) {
      try {
        const publicHex = AddressValue.ecContext
          .keyFromPublic(AddressValue.ecContext.recoverPubKey(toUint8Array(msg), { r, s }, recoveryId))
          .getPublic('hex')
          .substring(2)
        const publicKey = toUint8Array(publicHex)
        const recoveredAddress = AddressValue.addressFromPublicKey(publicKey)
        valid = valid || equalArrayBuffers(recoveredAddress, expectedAddress)
        if (valid) break
      } catch (ex) {
        const error = ex as Error
        console.log(error.message)
        console.log(error.stack)
        continue
      }
    }
    return valid
  }

  static async verifyAsync(msg: ArrayBuffer, signature: Uint8Array, address: ArrayBuffer) {
    const verifier = await AddressValue.secp256k1()
    if (verifier && AddressValue.wasmSupport.canUseWasm) {
      let publicKey: Uint8Array | null = null
      for (const recoveryId of recoveryIds) {
        try {
          publicKey = verifier.recoverPublicKeyCompressed(toUint8Array(signature), recoveryId, toUint8Array(msg))
          if (verifier.validatePublicKey(publicKey)) break
        } catch (ex) {
          const error = ex as Error
          console.log(error.message)
          console.log(error.stack)
          continue
        }
      }
      if (publicKey) return verifier.verifySignatureCompact(toUint8Array(signature), publicKey, toUint8Array(msg))
    }
    // In all failure modes default to the JS implementation
    return AddressValue.verify(msg, signature, address)
  }

  protected static secp256k1(): Promise<Secp256k1 | null> {
    this._secp256k1 =
      this._secp256k1 ??
      (async () => {
        await wasmSupportStatic.initialize()
        await instantiateSecp256k1()
      })()
    return this._secp256k1
  }

  verify(msg: ArrayBuffer, signature: ArrayBuffer) {
    return AddressValue.verify(msg, signature, this.bytes)
  }
}
