import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import {
  AccountConfig,
  AccountModel,
  MnemonicInitializationConfig,
  PhraseInitializationConfig,
  PrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import { DataLike, toUint8Array, XyoData } from '@xyo-network/core'
import shajs from 'sha.js'

import { KeyPair } from './Key'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

const nameOf = <T>(name: keyof T) => name

const getPrivateKeyFromMnemonic = (mnemonic: string, path?: string) => {
  const node = HDNode.fromMnemonic(mnemonic)
  const wallet = path ? node.derivePath(path) : node
  return wallet.privateKey.padStart(64, '0')
}

const getPrivateKeyFromPhrase = (phrase: string) => {
  return shajs('sha256').update(phrase).digest('hex').padStart(64, '0')
}

export class Account extends KeyPair implements AccountModel {
  private _isXyoWallet = true
  private _previousHash?: XyoData

  constructor(opts?: AccountConfig) {
    let privateKeyToUse: DataLike | undefined = undefined
    if (opts) {
      if (nameOf<PhraseInitializationConfig>('phrase') in opts) {
        privateKeyToUse = toUint8Array(shajs('sha256').update(opts.phrase).digest('hex').padStart(64, '0'))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in opts) {
        privateKeyToUse = toUint8Array(opts.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in opts) {
        privateKeyToUse = getPrivateKeyFromMnemonic(opts.mnemonic, opts?.path)
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    if (opts?.previousHash) this._previousHash = new XyoData(32, opts.previousHash)
  }

  /** @deprecated use addressValue instead */
  get address() {
    return this.public.address.hex
  }

  get addressValue() {
    return this.public.address
  }

  get previousHash() {
    return this._previousHash
  }

  /** @deprecated use private instead */
  get privateKey() {
    return this.private
  }

  /** @deprecated use public instead */
  get publicKey() {
    return this.public
  }

  static fromMnemonic = (mnemonic: string, path?: string): Account => {
    return Account.fromPrivateKey(getPrivateKeyFromMnemonic(mnemonic, path))
  }

  static fromPhrase(phrase: string) {
    return Account.fromPrivateKey(getPrivateKeyFromPhrase(phrase))
  }

  static fromPrivateKey(key: Uint8Array | string) {
    const privateKey = typeof key === 'string' ? toUint8Array(key.padStart(64, '0')) : key
    return new Account({ privateKey })
  }

  static isXyoWallet(value: unknown): boolean {
    return (value as Account)?._isXyoWallet || false
  }

  static random() {
    return new Account()
  }

  sign(hash: Uint8Array | string) {
    this._previousHash = new XyoData(32, hash)
    return this.private.sign(hash)
  }

  verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }
}

/** @deprecated use Account instead */
export class XyoAccount extends Account {}
