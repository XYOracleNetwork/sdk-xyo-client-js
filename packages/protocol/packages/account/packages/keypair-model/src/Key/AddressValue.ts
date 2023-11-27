import { EllipticKeyInstance } from './EllipticKey'

export interface AddressValueInstance extends EllipticKeyInstance {
  verify(msg: ArrayBuffer, signature: ArrayBuffer): boolean
}

export interface AddressValueStatic {
  new (address: ArrayBuffer): AddressValueInstance
  addressFromAddressOrPublicKey(bytes: ArrayBuffer): ArrayBuffer
  addressFromPublicKey(key: ArrayBuffer): ArrayBuffer
  isAddress(value: unknown): boolean
  verify(msg: ArrayBuffer, signature: ArrayBuffer, address: ArrayBuffer): boolean
}
