import { PrivateKeyInstance } from './PrivateKey'
import { PublicKeyInstance } from './PublicKey'

export interface KeyPairInstance {
  private: PrivateKeyInstance
  public: PublicKeyInstance
}

export interface KeyPairStatic {
  new (privateKeyData?: ArrayBuffer): KeyPairInstance
  isXyoKeyPair(value: unknown): boolean
}
