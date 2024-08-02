import { EllipticKeyInstance } from './EllipticKey.ts'
import type { PublicKeyInstance } from './PublicKey.ts'

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
