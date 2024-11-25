import type { AddressValueInstance } from './AddressValue.ts'
import type { EllipticKeyInstance } from './EllipticKey.ts'

export interface PublicKeyInstance extends EllipticKeyInstance {
  get address(): AddressValueInstance
  verify(msg: ArrayBufferLike, signature: ArrayBufferLike): boolean | Promise<boolean>
}

export interface PublicKeyStatic {
  create(bytes: ArrayBufferLike): Promise<PublicKeyInstance>
  isPublicKey(value: unknown): boolean
}
