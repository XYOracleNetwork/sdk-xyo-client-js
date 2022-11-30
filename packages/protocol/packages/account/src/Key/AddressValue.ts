import { DataLike, toUint8Array, XyoData } from '@xyo-network/core'

import { EllipticKey } from './EllipticKey'

export class AddressValue extends EllipticKey {
  private _isXyoAddress = true
  constructor(address: DataLike) {
    super(20, AddressValue.addressFromAddressOrPublicKey(address))
  }

  public static addressFromAddressOrPublicKey(bytes: DataLike) {
    const bytesArray = toUint8Array(bytes)
    return bytesArray.length === 20 ? bytesArray : AddressValue.addressFromPublicKey(bytesArray)
  }

  public static addressFromPublicKey(key: DataLike) {
    return new XyoData(64, key).keccak256.slice(12).toString('hex').padStart(40, '0')
  }

  public static isXyoAddress(value: unknown) {
    return (value as AddressValue)._isXyoAddress
  }

  //there has to be a better way to do this other than trying all four numbers
  //maybe we can get the number from the address more easily
  public static verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike) {
    let valid = false
    const sigArray = toUint8Array(signature)
    const r = sigArray.slice(0, 32)
    const s = sigArray.slice(32, 64)

    const expectedAddress = new AddressValue(address).hex

    for (let i = 0; i < 4; i++) {
      try {
        const publicKey = AddressValue.ecContext
          .keyFromPublic(AddressValue.ecContext.recoverPubKey(toUint8Array(msg), { r, s }, i))
          .getPublic('hex')
          .slice(2)
        const recoveredAddress = AddressValue.addressFromPublicKey(publicKey)
        valid = valid || recoveredAddress === expectedAddress
      } catch (ex) {
        null
      }
    }
    return valid
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return AddressValue.verify(msg, signature, this.bytes)
  }
}

/** @deprecated use AddressValue instead */
export class XyoAddressValue extends AddressValue {}
