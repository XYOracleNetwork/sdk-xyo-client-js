import { EllipticKeyInstance } from './EllipticKey.js'
import type { PublicKeyInstance } from './PublicKey.js'

export interface PrivateKeyConfig {
  privateKeyData?: ArrayBuffer
}

export interface PrivateKeyInstance extends EllipticKeyInstance {
  public: PublicKeyInstance
  sign: (hash: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>
  verify: (msg: ArrayBuffer, signature: ArrayBuffer) => boolean | Promise<boolean>
}

export interface PrivateKeyStatic {
  create(value: ArrayBuffer): Promise<PrivateKeyInstance>
  isPrivateKey(value: unknown): boolean
}
