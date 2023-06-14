import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { Data, DataLike, toUint8Array, WasmSupport } from '@xyo-network/core'
import { AddressValueInstance, AddressValueStatic } from '@xyo-network/key-model'

import { EllipticKey } from './EllipticKey'

const wasmSupportStatic = new WasmSupport(['bigInt'])
const recoveryIds = [0, 1, 2, 3] as const

@staticImplements<AddressValueStatic>()
export class AddressValue extends EllipticKey implements AddressValueInstance {
  static readonly wasmSupport = wasmSupportStatic
  protected static readonly secp256k1: Promise<Secp256k1 | null> = wasmSupportStatic
    .initialize()
    .then(() => instantiateSecp256k1())
    .catch(() => null)

  private _isAddress = true
  constructor(address: DataLike) {
    super(20, AddressValue.addressFromAddressOrPublicKey(address))
  }

  static addressFromAddressOrPublicKey(bytes: DataLike) {
    const bytesArray = toUint8Array(bytes)
    return bytesArray.length === 20 ? bytesArray : AddressValue.addressFromPublicKey(bytesArray)
  }

  static addressFromPublicKey(key: DataLike) {
    return new Data(64, key).keccak256.slice(12).toString('hex').padStart(40, '0')
  }

  static isAddress(value: unknown) {
    return (value as AddressValue)._isAddress
  }

  //there has to be a better way to do this other than trying all four numbers
  //maybe we can get the number from the address more easily
  static verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike) {
    let valid = false
    const sigArray = toUint8Array(signature)
    const r = sigArray.slice(0, 32)
    const s = sigArray.slice(32, 64)

    const expectedAddress = new AddressValue(address).hex
    for (const recoveryId of recoveryIds) {
      try {
        const publicKey = AddressValue.ecContext
          .keyFromPublic(AddressValue.ecContext.recoverPubKey(toUint8Array(msg), { r, s }, recoveryId))
          .getPublic('hex')
          .slice(2)
        const recoveredAddress = AddressValue.addressFromPublicKey(publicKey)
        valid = valid || recoveredAddress === expectedAddress
        if (valid) break
      } catch (ex) {
        continue
      }
    }
    return valid
  }

  static async verifyAsync(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike) {
    const verifier = await AddressValue.secp256k1
    if (verifier && AddressValue.wasmSupport.canUseWasm) {
      let publicKey: Uint8Array | null = null
      for (const recoveryId of recoveryIds) {
        try {
          publicKey = verifier.recoverPublicKeyCompressed(toUint8Array(signature), recoveryId, toUint8Array(msg))
          if (verifier.validatePublicKey(publicKey)) break
        } catch (ex) {
          continue
        }
      }
      if (publicKey) return verifier.verifySignatureCompact(toUint8Array(signature), publicKey, toUint8Array(msg))
    }
    // In all failure modes default to the JS implementation
    return AddressValue.verify(msg, signature, address)
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return AddressValue.verify(msg, signature, this.bytes)
  }
}
