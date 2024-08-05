import { EllipticKeyInstance } from './EllipticKey.ts'

export interface AddressValueInstance extends EllipticKeyInstance {}

export interface AddressValueStatic {
  new (address: ArrayBuffer): AddressValueInstance
  addressFromAddressOrPublicKey(bytes: ArrayBuffer): ArrayBuffer
  addressFromPublicKey(key: ArrayBuffer): ArrayBuffer
  isAddress(value: unknown): boolean
}
