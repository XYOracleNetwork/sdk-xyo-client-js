import { DataLike } from '@xyo-network/core'

import { AddressValueModel } from './AddressValue'
import { EllipticKeyModel } from './EllipticKey'

export interface PublicKeyModelStatic {
  isXyoPublicKey(value: unknown): boolean
}

export interface PublicKeyModel extends EllipticKeyModel {
  new (bytes: DataLike): this
  get address(): AddressValueModel
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XyoPublicKeyModel extends PublicKeyModel {}
