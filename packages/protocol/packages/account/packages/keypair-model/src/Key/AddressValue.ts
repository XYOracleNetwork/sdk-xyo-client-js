import { DataLike } from '@xyo-network/core'

import { EllipticKeyInstance } from './EllipticKey'

export interface AddressValueInstance extends EllipticKeyInstance {
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface AddressValueStatic {
  new (address: DataLike): AddressValueInstance
  addressFromAddressOrPublicKey(bytes: DataLike): Uint8Array | string
  addressFromPublicKey(key: DataLike): string
  isAddress(value: unknown): boolean
  verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike): boolean
}
