import { EllipticKeyInstance } from './EllipticKey.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AddressValueInstance extends EllipticKeyInstance {}

export interface AddressValueStatic {
  new (address: ArrayBuffer): AddressValueInstance
  addressFromAddressOrPublicKey(bytes: ArrayBuffer): ArrayBuffer
  addressFromPublicKey(key: ArrayBuffer): ArrayBuffer
  isAddress(value: unknown): boolean
}
