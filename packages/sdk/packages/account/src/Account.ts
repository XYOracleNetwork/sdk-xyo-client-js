import { toUint8Array, XyoData, XyoDataLike } from '@xyo-network/core'
import shajs from 'sha.js'

import { XyoKeyPair, XyoPublicKey } from './Key'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

export interface XyoAccountConfig {
  privateKey?: XyoDataLike
  phrase?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
export class XyoAccount extends XyoKeyPair {
  private _isXyoWallet = true
  private _previousHash?: XyoData

  constructor({ privateKey, phrase }: XyoAccountConfig = {}) {
    const privateKeyToUse = privateKey ? toUint8Array(privateKey) : phrase ? toUint8Array(shajs('sha256').update(phrase).digest('hex')) : undefined
    super(privateKeyToUse)
  }

  /** @deprecated use addressValue instead */
  public get address() {
    return this.public.address.hex
  }

  public get addressValue() {
    return this.public.address
  }

  public get previousHash() {
    return this._previousHash
  }

  /** @deprecated use private instead */
  public get privateKey() {
    return this.private
  }

  /** @deprecated use public instead */
  public get publicKey() {
    return this.public
  }

  public sign(hash: Uint8Array | string) {
    this._previousHash = new XyoData(32, hash)
    return this.private.sign(hash)
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex')
    return XyoAccount.fromPrivateKey(privateKey)
  }

  static fromPrivateKey(key: Uint8Array | string) {
    const privateKey = toUint8Array(key)
    return new XyoAccount({ privateKey })
  }

  static random() {
    return new XyoAccount()
  }

  static isXyoWallet(value: unknown) {
    return (value as XyoAccount)._isXyoWallet
  }
}

/** @deprecated use XyoWallet instead */
export class XyoAddress extends XyoAccount {
  public get previousHashString() {
    return this.previousHash?.hex
  }

  static fromPhrase(phrase: string) {
    return XyoAccount.fromPhrase(phrase)
  }

  static fromPrivateKey(key: Uint8Array | string) {
    return XyoAccount.fromPrivateKey(key)
  }

  static random() {
    return XyoAccount.random()
  }

  static verifyAddress(msg: Uint8Array | string, signature: Uint8Array | string, address: XyoDataLike) {
    return new XyoPublicKey(address).verify(msg, signature)
  }
}

/** @deprecated use XyoAccount instead */
export class XyoWallet extends XyoAccount {}
