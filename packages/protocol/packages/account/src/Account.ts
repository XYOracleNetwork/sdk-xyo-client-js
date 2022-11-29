import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { toUint8Array, XyoData, XyoDataLike } from '@xyo-network/core'
import shajs from 'sha.js'

import { XyoKeyPair, XyoPublicKey } from './Key'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

export interface XyoAccountConfig {
  phrase?: string
  privateKey?: XyoDataLike
}

export class XyoAccount extends XyoKeyPair {
  private _isXyoWallet = true
  private _previousHash?: XyoData

  constructor({ privateKey, phrase }: XyoAccountConfig = {}) {
    const privateKeyToUse = privateKey
      ? toUint8Array(privateKey)
      : phrase
      ? toUint8Array(shajs('sha256').update(phrase).digest('hex').padStart(64, '0'))
      : undefined
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
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

  static fromMnemonic = (mnemonic: string, path?: string): XyoAccount => {
    const node = HDNode.fromMnemonic(mnemonic)
    const wallet = path ? node.derivePath(path) : node
    const privateKey = wallet.privateKey.padStart(64, '0')
    return new XyoAccount({ privateKey })
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex').padStart(64, '0')
    return XyoAccount.fromPrivateKey(privateKey)
  }

  static fromPrivateKey(key: Uint8Array | string) {
    const privateKey = typeof key === 'string' ? toUint8Array(key.padStart(64, '0')) : key
    return new XyoAccount({ privateKey })
  }

  static isXyoWallet(value: unknown) {
    return (value as XyoAccount)._isXyoWallet
  }

  static random() {
    return new XyoAccount()
  }

  public sign(hash: Uint8Array | string) {
    this._previousHash = new XyoData(32, hash)
    return this.private.sign(hash)
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }
}

/** @deprecated use XyoWallet instead */
export class XyoAddress extends XyoAccount {
  public get previousHashString() {
    return this.previousHash?.hex
  }

  static verifyAddress(msg: Uint8Array | string, signature: Uint8Array | string, address: XyoDataLike) {
    return new XyoPublicKey(address).verify(msg, signature)
  }
}

/** @deprecated use XyoAccount instead */
export class XyoWallet extends XyoAccount {}
