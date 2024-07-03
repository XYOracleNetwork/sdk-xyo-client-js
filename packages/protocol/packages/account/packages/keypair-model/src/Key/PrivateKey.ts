import { EllipticKeyInstance } from './EllipticKey'
import { PublicKeyInstance } from './PublicKey'

export interface PrivateKeyInstance extends EllipticKeyInstance {
  getPublic: () => Promise<PublicKeyInstance>
  sign: (hash: ArrayBuffer) => ArrayBuffer | Promise<ArrayBuffer>
  verify: (msg: ArrayBuffer, signature: ArrayBuffer) => boolean | Promise<boolean>
}

export interface PrivateKeyStatic {
  new (value: ArrayBuffer): PrivateKeyInstance
  isPrivateKey(value: unknown): boolean
}
