import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { DataLike, toUint8Array, XyoData } from '@xyo-network/core'
import shajs from 'sha.js'

import { KeyPair } from './Key'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

const nameOf = <TObj>(name: keyof TObj) => name

interface PhraseInitializationConfig {
  phrase: string
}
interface PrivateKeyInitializationConfig {
  privateKey: DataLike
}
interface MnemonicInitializationConfig {
  mnemonic: string
  path?: string
}
interface AccountOptions {
  previousHash?: XyoData
}

export type InitializationConfig = PhraseInitializationConfig | PrivateKeyInitializationConfig | MnemonicInitializationConfig

export type AccountConfig = InitializationConfig & AccountOptions

export class Account extends KeyPair {
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
        const node = HDNode.fromMnemonic(opts.mnemonic)
        const wallet = opts?.path ? node.derivePath(opts.path) : node
        privateKeyToUse = wallet.privateKey.padStart(64, '0')
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    if (opts?.previousHash) this._previousHash = opts.previousHash
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

  static fromMnemonic = (mnemonic: string, path?: string): Account => {
    const node = HDNode.fromMnemonic(mnemonic)
    const wallet = path ? node.derivePath(path) : node
    const privateKey = wallet.privateKey.padStart(64, '0')
    return new Account({ privateKey })
  }

  static fromPhrase(phrase: string) {
    const privateKey = shajs('sha256').update(phrase).digest('hex').padStart(64, '0')
    return Account.fromPrivateKey(privateKey)
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

  public sign(hash: Uint8Array | string) {
    this._previousHash = new XyoData(32, hash)
    return this.private.sign(hash)
  }

  public verify(msg: Uint8Array | string, signature: Uint8Array | string) {
    return this.public.address.verify(msg, signature)
  }
}

/** @deprecated use Account instead */
export class XyoAccount extends Account {}
