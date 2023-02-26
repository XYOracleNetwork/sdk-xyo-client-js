import { DataLike } from '@xyo-network/core'

import { EllipticKeyModel } from './EllipticKey'

export interface AddressValueModel extends EllipticKeyModel {
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface AddressValueModelStatic {
  new (address: DataLike): AddressValueModel
  addressFromAddressOrPublicKey(bytes: DataLike): Uint8Array
  addressFromPublicKey(key: DataLike): string
  isXyoAddress(value: unknown): boolean
  verify(msg: Uint8Array | string, signature: Uint8Array | string, address: DataLike): boolean
}
