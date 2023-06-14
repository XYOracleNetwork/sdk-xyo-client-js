import { DataLike } from '@xyo-network/core'

import { AddressValueInstance } from './AddressValue'
import { EllipticKeyInstance } from './EllipticKey'

export interface PublicKeyInstance extends EllipticKeyInstance {
  get address(): AddressValueInstance
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean | Promise<boolean>
}

export interface PublicKeyStatic {
  new (bytes: DataLike): PublicKeyInstance
  isPublicKey(value: unknown): boolean
}
