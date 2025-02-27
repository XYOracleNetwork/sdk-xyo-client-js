import type { EllipticKeyInstance } from './EllipticKey.ts'

export interface AddressValueInstance extends EllipticKeyInstance {}

export interface AddressValueStatic {
  new (address: ArrayBuffer): AddressValueInstance
  addressFromAddressOrPublicKey(bytes: ArrayBufferLike): ArrayBufferLike
  addressFromPublicKey(key: ArrayBufferLike): ArrayBufferLike
  isAddress(value: unknown): boolean
}
