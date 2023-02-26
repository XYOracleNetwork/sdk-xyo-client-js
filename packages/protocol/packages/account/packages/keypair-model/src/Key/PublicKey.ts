import { DataLike } from '@xyo-network/core'

import { AddressValueModel } from './AddressValue'
import { EllipticKeyModel } from './EllipticKey'

export interface PublicKeyModel extends EllipticKeyModel {
  get address(): AddressValueModel
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface PublicKeyModelStatic {
  new (bytes: DataLike): PublicKeyModel
  isXyoPublicKey(value: unknown): boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XyoPublicKeyModel extends PublicKeyModel {}
