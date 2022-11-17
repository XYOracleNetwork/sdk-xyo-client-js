import { toUint8Array, XyoData, XyoDataLike } from '@xyo-network/core'

import { XyoEllipticKey } from './XyoEllipticKey'

export class XyoAddressValue extends XyoEllipticKey {
  private _isXyoAddress = true
  constructor(address: XyoDataLike) {
    super(20, XyoAddressValue.addressFromAddressOrPublicKey(address))
  }

  public static addressFromAddressOrPublicKey(bytes: XyoDataLike) {
    const bytesArray = toUint8Array(bytes)
    return bytesArray.length === 20 ? bytesArray : XyoAddressValue.addressFromPublicKey(bytesArray)
  }

  public static addressFromPublicKey(key: XyoDataLike) {
    return new XyoData(64, key).keccak256.slice(12).toString('hex').padStart(40, '0')
  }

  public static isXyoAddress(value: unknown) {
    return (value as XyoAddressValue)._isXyoAddress
  }

  //there has to be a better way to do this other than trying all four numbers
  //maybe we can get the number from the address more easily
  public static verify(msg: Uint8Array | string, signature: Uint8Array | string, address: XyoDataLike) {
    let valid = false
    const sigArray = toUint8Array(signature)
    const r = sigArray.slice(0, 32)
    const s = sigArray.slice(32, 64)

    const expectedAddress = new XyoAddressValue(address).hex

    for (let i = 0; i < 4; i++) {
      try {
        const publicKey = XyoAddressValue.ecContext
          .keyFromPublic(XyoAddressValue.ecContext.recoverPubKey(toUint8Array(msg), { r, s }, i))
          .getPublic('hex')
          .slice(2)
        const recoveredAddress = XyoAddressValue.addressFromPublicKey(publicKey)
        valid = valid || recoveredAddress === expectedAddress
      } catch (ex) {
        null
      }
    }
    return valid
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return XyoAddressValue.verify(msg, signature, this.bytes)
  }
}
