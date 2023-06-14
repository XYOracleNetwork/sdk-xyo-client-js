import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import {
  AccountConfig,
  AccountInstance,
  AccountStatic,
  MnemonicInitializationConfig,
  PhraseInitializationConfig,
  PrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import { Data, DataLike, toUint8Array } from '@xyo-network/core'
import { Lock } from 'semaphore-async-await'
import shajs from 'sha.js'

import { KeyPair } from './Key'
import { PreviousHashStore } from './PreviousHashStore'

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

@staticImplements<AccountStatic>()
export class Account extends KeyPair implements AccountInstance {
  static previousHashStore: PreviousHashStore | undefined = undefined
  protected _node: HDNode | undefined = undefined
  protected _previousHash?: Data
  private _isXyoWallet = true
  private readonly _signingLock = new Lock()

  constructor(opts?: AccountConfig) {
    let privateKeyToUse: DataLike | undefined = undefined
    let node: HDNode | undefined = undefined
    if (opts) {
      if (nameOf<PhraseInitializationConfig>('phrase') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(opts.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in opts) {
        privateKeyToUse = toUint8Array(opts.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in opts) {
        privateKeyToUse = getPrivateKeyFromMnemonic(opts.mnemonic, opts?.path)
        node = opts?.path ? HDNode.fromMnemonic(opts.mnemonic).derivePath(opts.path) : HDNode.fromMnemonic(opts.mnemonic)
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    this._node = node
    if (opts?.previousHash) this._previousHash = new Data(32, opts.previousHash)
  }

  get addressValue() {
    return this.public.address
  }

  get previousHash() {
    return this._previousHash
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

  static isAddress(address: string) {
    return address.length === 40
  }

  static isXyoWallet(value: unknown): boolean {
    return (value as Account)?._isXyoWallet || false
  }

  static random() {
    return new Account()
  }

  async sign(hash: Uint8Array | string): Promise<Uint8Array> {
    await KeyPair.wasmInitialized
    await this._signingLock.acquire()
    try {
      const signature = this.private.sign(hash)
      this._previousHash = new Data(32, hash)
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.addressValue.hex, this._previousHash.hex)
      }
      return signature
    } finally {
      this._signingLock.release()
    }
  }

  async verify(msg: Uint8Array | string, signature: Uint8Array | string): Promise<boolean> {
    await KeyPair.wasmInitialized
    return this.public.address.verify(msg, signature)
  }
}
