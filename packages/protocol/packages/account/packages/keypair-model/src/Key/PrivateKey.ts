import { EllipticKeyInstance } from './EllipticKey.ts'
import { PublicKeyInstance } from './PublicKey.ts'

export interface PrivateKeyConfig {
  privateKeyData?: ArrayBufferLike
}

export interface PrivateKeyInstance extends EllipticKeyInstance {
  public: PublicKeyInstance
  sign: (hash: ArrayBufferLike) => ArrayBufferLike | Promise<ArrayBufferLike>
  verify: (msg: ArrayBufferLike, signature: ArrayBufferLike) => boolean | Promise<boolean>
}

export interface PrivateKeyStatic {
  create(value: ArrayBufferLike | bigint): Promise<PrivateKeyInstance>
  isPrivateKey(value: unknown): boolean
}
