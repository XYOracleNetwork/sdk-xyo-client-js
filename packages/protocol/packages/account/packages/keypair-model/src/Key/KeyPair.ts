import { DataLike } from '@xyo-network/core'

import { XyoPrivateKeyModel } from './PrivateKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface KeyPairModelStatic {
  isXyoKeyPair(value: unknown): boolean
}

export interface KeyPairModel {
  new (privateKeyData?: DataLike): this
  get private(): XyoPrivateKeyModel
  get public(): XyoPublicKeyModel
}
