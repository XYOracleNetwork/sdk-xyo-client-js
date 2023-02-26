import { DataLike } from '@xyo-network/core'

import { EllipticKey } from './EllipticKey'

export interface AddressValueModelStatic {
  addressFromAddressOrPublicKey(bytes: DataLike): Uint8Array
  addressFromPublicKey(key: DataLike): string
  isXyoAddress(value: unknown): boolean
  verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike): boolean
}

export interface AddressValueModel extends EllipticKey {
  new (address: DataLike): this
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}
