import { AddressValueInstance } from './AddressValue'
import { EllipticKeyInstance } from './EllipticKey'

export interface PublicKeyInstance extends EllipticKeyInstance {
  get address(): AddressValueInstance
  verify(msg: ArrayBuffer, signature: ArrayBuffer): boolean | Promise<boolean>
}

export interface PublicKeyStatic {
  create(bytes: ArrayBuffer): Promise<PublicKeyInstance>
  isPublicKey(value: unknown): boolean
}
