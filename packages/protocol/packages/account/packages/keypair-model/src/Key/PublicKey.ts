import { AddressValueInstance } from './AddressValue'
import { EllipticKeyInstance } from './EllipticKey'

export interface PublicKeyInstance extends EllipticKeyInstance {
  get address(): AddressValueInstance
  verify(msg: ArrayBuffer, signature: ArrayBuffer): boolean | Promise<boolean>
}

export interface PublicKeyStatic {
  new (bytes: ArrayBuffer): PublicKeyInstance
  isPublicKey(value: unknown): boolean
}
