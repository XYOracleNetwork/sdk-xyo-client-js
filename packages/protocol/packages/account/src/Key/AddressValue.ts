import { instantiateSecp256k1, Secp256k1 } from '@bitauth/libauth'
import { staticImplements } from '@xylabs/static-implements'
import { DataLike, toUint8Array, WasmSupport, XyoData } from '@xyo-network/core'
import { AddressValueInstance, AddressValueStatic } from '@xyo-network/key-model'

import { EllipticKey } from './EllipticKey'

const wasmSupportStatic = new WasmSupport(['bigInt'])
const offset = [0, 1, 2, 3]

@staticImplements<AddressValueStatic>()
export class AddressValue extends EllipticKey implements AddressValueInstance {
  static readonly wasmSupport = wasmSupportStatic
  protected static readonly secp256k1: Promise<Secp256k1 | null> = wasmSupportStatic
    .initialize()
    .then(() => instantiateSecp256k1())
    .catch(() => null)

  private _isXyoAddress = true
  constructor(address: DataLike) {
    super(20, AddressValue.addressFromAddressOrPublicKey(address))
  }

  static addressFromAddressOrPublicKey(bytes: DataLike) {
    const bytesArray = toUint8Array(bytes)
    return bytesArray.length === 20 ? bytesArray : AddressValue.addressFromPublicKey(bytesArray)
  }

  static addressFromPublicKey(key: DataLike) {
    return new XyoData(64, key).keccak256.slice(12).toString('hex').padStart(40, '0')
  }

  static isXyoAddress(value: unknown) {
    return (value as AddressValue)._isXyoAddress
  }

  //there has to be a better way to do this other than trying all four numbers
  //maybe we can get the number from the address more easily
  static verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike) {
    let valid = false
    const sigArray = toUint8Array(signature)
    const r = sigArray.slice(0, 32)
    const s = sigArray.slice(32, 64)

    const expectedAddress = new AddressValue(address).hex
    for (const i of offset) {
      try {
        const publicKey = AddressValue.ecContext
          .keyFromPublic(AddressValue.ecContext.recoverPubKey(toUint8Array(msg), { r, s }, i))
          .getPublic('hex')
          .slice(2)
        const recoveredAddress = AddressValue.addressFromPublicKey(publicKey)
        valid = valid || recoveredAddress === expectedAddress
        if (valid) break
      } catch (ex) {
        null
      }
    }
    return valid
  }

  static async verifyAsync(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike) {
    const verifier = await AddressValue.secp256k1
    if (verifier && AddressValue.wasmSupport.canUseWasm) {
      return verifier.verifySignatureCompact(toUint8Array(signature), toUint8Array(address), toUint8Array(msg))
    } else {
      return AddressValue.verify(msg, signature, address)
    }
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return AddressValue.verify(msg, signature, this.bytes)
  }
}
