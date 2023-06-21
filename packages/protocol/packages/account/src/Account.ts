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
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { Mutex } from 'async-mutex'
import shajs from 'sha.js'

import { KeyPair } from './Key'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

const nameOf = <T>(name: keyof T) => name

const getPrivateKeyFromMnemonic = (mnemonic: string, path?: string) => {
  const node = HDNode.fromMnemonic(mnemonic)
  const wallet = path ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0')
}

const getPrivateKeyFromPhrase = (phrase: string) => {
  return shajs('sha256').update(phrase).digest('hex').padStart(64, '0')
}

@staticImplements<AccountStatic>()
export class Account extends KeyPair implements AccountInstance {
  static previousHashStore: PreviousHashStore | undefined = undefined
  protected static _addressMap: Record<string, WeakRef<Account>> = {}
  protected _node: HDNode | undefined = undefined
  protected _previousHash?: Data
  private _isXyoWallet = true
  private readonly _signingMutex = new Mutex()

  protected constructor(opts?: AccountConfig) {
    let privateKeyToUse: DataLike | undefined = undefined
    let node: HDNode | undefined = undefined
    if (opts) {
      if (nameOf<PhraseInitializationConfig>('phrase') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(opts.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in opts) {
        privateKeyToUse = toUint8Array(opts.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in opts) {
        privateKeyToUse = getPrivateKeyFromMnemonic(opts.mnemonic, opts?.path)
        node = opts?.path ? HDNode.fromMnemonic(opts.mnemonic).derivePath?.(opts.path) : HDNode.fromMnemonic(opts.mnemonic)
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    this._node = node
  }

  get address() {
    return this.addressValue.hex
  }

  get addressValue() {
    return this.public.address
  }

  get previousHash() {
    return this._previousHash
  }

  static async create(opts?: AccountConfig): Promise<AccountInstance> {
    return (await new Account(opts).loadPreviousHash(opts?.previousHash)).verifyUniqueAddress()
  }

  static async fromMnemonic(mnemonic: string, path?: string): Promise<AccountInstance> {
    return await Account.fromPrivateKey(getPrivateKeyFromMnemonic(mnemonic, path))
  }

  static async fromPhrase(phrase: string): Promise<AccountInstance> {
    return await Account.fromPrivateKey(getPrivateKeyFromPhrase(phrase))
  }

  static async fromPrivateKey(key: Uint8Array | string): Promise<AccountInstance> {
    const privateKey = typeof key === 'string' ? toUint8Array(key.padStart(64, '0')) : key
    return await Account.create({ privateKey })
  }

  static isAddress(address: string) {
    return address.length === 40
  }

  static isXyoWallet(value: unknown): boolean {
    return (value as Account)?._isXyoWallet || false
  }

  static random(): Account {
    return new Account()
  }

  async loadPreviousHash(previousHash?: Uint8Array | string): Promise<AccountInstance> {
    return await this._signingMutex.runExclusive(async () => {
      if (previousHash) {
        this._previousHash = previousHash ? new Data(32, previousHash) : undefined
      } else {
        const previousHashStoreValue = await Account.previousHashStore?.getItem(this.addressValue.hex)
        if (previousHashStoreValue) {
          this._previousHash = new Data(32, previousHashStoreValue)
        }
      }
      return this
    })
  }

  async sign(hash: Uint8Array | string, previousHash: string | Data | undefined): Promise<Uint8Array> {
    await KeyPair.wasmInitialized
    return await this._signingMutex.runExclusive(async () => {
      const currentPreviousHash = this.previousHash?.hex
      const passedCurrentHash = typeof previousHash === 'string' ? previousHash : previousHash?.hex
      assertEx(
        currentPreviousHash === passedCurrentHash,
        `Used and current previous hashes do not match [${currentPreviousHash} !== ${passedCurrentHash}]`,
      )

      const signature = this.private.sign(hash)
      this._previousHash = new Data(32, hash)
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.addressValue.hex, this._previousHash.hex)
      }
      return signature
    })
  }

  async verify(msg: Uint8Array | string, signature: Uint8Array | string): Promise<boolean> {
    await KeyPair.wasmInitialized
    return this.public.address.verify(msg, signature)
  }

  verifyUniqueAddress() {
    const address = this.addressValue.hex
    const currentAddressObject = Account._addressMap[address]?.deref()
    if (currentAddressObject === undefined) {
      Account._addressMap[address] = new WeakRef(this)
    } else {
      //assertEx(this === currentAddressObject, `Two Accounts have the same address [${address}]`)
      return currentAddressObject
    }
    return this
  }
}
