import { Promisable } from '@xylabs/promise'

import { PrivateKeyInstance } from './PrivateKey'
import { PublicKeyInstance } from './PublicKey'

export interface KeyPairInstance {
  getPrivate: () => Promisable<PrivateKeyInstance>
  getPublic: () => Promisable<PublicKeyInstance>
}

export interface KeyPairStatic {
  new (privateKey: PrivateKeyInstance): KeyPairInstance
  isXyoKeyPair(value: unknown): boolean
}
