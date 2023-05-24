import { DataLike } from '@xyo-network/core'

import { EllipticKeyInstance } from './EllipticKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface PrivateKeyInstance extends EllipticKeyInstance {
  get public(): XyoPublicKeyModel
  sign(hash: DataLike): Uint8Array | Promise<Uint8Array>
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface PrivateKeyStatic {
  new (value?: DataLike): PrivateKeyInstance
  isXyoPrivateKey(value: unknown): boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XyoPrivateKeyModel extends PrivateKeyInstance {}
