import { DataLike } from '@xyo-network/core'

import { EllipticKeyModel } from './EllipticKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface PrivateKeyModel extends EllipticKeyModel {
  get public(): XyoPublicKeyModel
  sign(hash: DataLike): string
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface PrivateKeyModelStatic {
  new (value?: DataLike): PrivateKeyModel
  isXyoPrivateKey(value: unknown): boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XyoPrivateKeyModel extends PrivateKeyModel {}
