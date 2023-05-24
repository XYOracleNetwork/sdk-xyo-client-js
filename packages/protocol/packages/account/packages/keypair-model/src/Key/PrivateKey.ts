import { DataLike } from '@xyo-network/core'

import { EllipticKeyInstance } from './EllipticKey'
import { PublicKeyInstance } from './PublicKey'

export interface PrivateKeyInstance extends EllipticKeyInstance {
  get public(): PublicKeyInstance
  sign(hash: DataLike): Uint8Array | Promise<Uint8Array>
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean | Promise<boolean>
}

export interface PrivateKeyStatic {
  new (value?: DataLike): PrivateKeyInstance
  isXyoPrivateKey(value: unknown): boolean
}
