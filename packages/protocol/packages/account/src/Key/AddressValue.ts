import { staticImplements } from '@xylabs/static-implements'
import { Data } from '@xyo-network/data'
import { AddressValueInstance, AddressValueStatic } from '@xyo-network/key-model'

import { Elliptic } from '../Elliptic.ts'
import { EllipticKey } from './EllipticKey.ts'

@staticImplements<AddressValueStatic>()
export class AddressValue extends EllipticKey implements AddressValueInstance {
  private _isAddress = true

  constructor(address: ArrayBufferLike) {
    super(20, AddressValue.addressFromAddressOrPublicKey(address))
  }

  static addressFromAddressOrPublicKey(bytes: ArrayBufferLike) {
    return bytes.byteLength === 20 ? bytes : AddressValue.addressFromPublicKey(bytes)
  }

  static addressFromPublicKey(key: ArrayBufferLike): ArrayBufferLike {
    return new Data(64, key).keccak256.slice(12)
  }

  static async initialize() {
    return !!(await Elliptic.secp256k1())
  }

  static isAddress(value: unknown) {
    return (value as AddressValue)._isAddress
  }
}
