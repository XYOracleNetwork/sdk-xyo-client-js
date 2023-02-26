import { DataLike } from '@xyo-network/core'

import { EllipticKeyModel } from './EllipticKey'

export interface AddressValueModelStatic {
  addressFromAddressOrPublicKey(bytes: DataLike): Uint8Array
  addressFromPublicKey(key: DataLike): string
  isXyoAddress(value: unknown): boolean
  verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike): boolean
}

export interface AddressValueModel extends EllipticKeyModel {
  new (address: DataLike): this
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}
