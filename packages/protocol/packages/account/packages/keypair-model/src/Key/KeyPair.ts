import { DataLike } from '@xyo-network/core'

import { XyoPrivateKeyModel } from './PrivateKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface KeyPairModel {
  get private(): XyoPrivateKeyModel
  get public(): XyoPublicKeyModel
}

export interface KeyPairModelStatic {
  new (privateKeyData?: DataLike): KeyPairModel
  isXyoKeyPair(value: unknown): boolean
}
