import { DataLike } from '@xyo-network/core'

import { XyoPrivateKeyModel } from './PrivateKey'
import { XyoPublicKeyModel } from './PublicKey'

export interface KeyPairInstance {
  get private(): XyoPrivateKeyModel
  get public(): XyoPublicKeyModel
}

export interface KeyPairStatic {
  new (privateKeyData?: DataLike): KeyPairInstance
  isXyoKeyPair(value: unknown): boolean
}
