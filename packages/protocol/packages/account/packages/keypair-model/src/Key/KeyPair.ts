import { DataLike } from '@xyo-network/core'

import { PrivateKeyInstance } from './PrivateKey'
import { PublicKeyInstance } from './PublicKey'

export interface KeyPairInstance {
  get private(): PrivateKeyInstance
  get public(): PublicKeyInstance
}

export interface KeyPairStatic {
  new (privateKeyData?: DataLike): KeyPairInstance
  isXyoKeyPair(value: unknown): boolean
}
