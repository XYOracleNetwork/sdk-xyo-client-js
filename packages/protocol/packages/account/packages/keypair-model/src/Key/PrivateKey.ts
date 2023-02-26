import { DataLike } from '@xyo-network/core'

import { EllipticKeyModel } from './EllipticKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface PrivateKeyModelStatic {
  isXyoPrivateKey(value: unknown): boolean
}

export interface PrivateKeyModel extends EllipticKeyModel {
  new (value?: DataLike): this
  get public(): XyoPublicKeyModel
  sign(hash: DataLike): string
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XyoPrivateKeyModel extends PrivateKeyModel {}
