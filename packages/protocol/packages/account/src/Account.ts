import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { bufferPolyfill } from '@xylabs/buffer'
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
  //we call this  incase we are in a browser [HDNode needs it]
  bufferPolyfill()
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
  protected static _protectedConstructorKey = Symbol()
  protected _node: HDNode | undefined = undefined
  protected _previousHash?: Data
  private readonly _signingMutex = new Mutex()

  constructor(key: unknown, params?: AccountConfig) {
    //we call this  incase we are in a browser [HDNode needs it]
    bufferPolyfill()
    assertEx(key === Account._protectedConstructorKey, 'Do not call this protected constructor')
    let privateKeyToUse: DataLike | undefined = undefined
    let node: HDNode | undefined = undefined
    if (params) {
      if (nameOf<PhraseInitializationConfig>('phrase') in params) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(params.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in params) {
        privateKeyToUse = toUint8Array(params.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in params) {
        privateKeyToUse = getPrivateKeyFromMnemonic(params.mnemonic, params?.path)
        node = params?.path ? HDNode.fromMnemonic(params.mnemonic).derivePath?.(params.path) : HDNode.fromMnemonic(params.mnemonic)
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.length === 32, `Private key must be 32 bytes [${privateKeyToUse?.length}]`)
    super(privateKeyToUse)
    this._node = node
  }

  get address() {
    return this.addressBytes.hex
  }

  get addressBytes() {
    return this.public.address
  }

  get previousHash() {
    return this.previousHashBytes?.hex
  }

  get previousHashBytes() {
    return this._previousHash
  }

  static async create(opts?: AccountConfig): Promise<AccountInstance> {
    return (await new Account(Account._protectedConstructorKey, opts).loadPreviousHash(opts?.previousHash)).verifyUniqueAddress() as AccountInstance
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

  static is(value: unknown): Account | undefined {
    return value instanceof Account ? value : undefined
  }

  static isAddress(address: string) {
    return address.length === 40
  }

  static randomSync(): Account {
    return new Account(Account._protectedConstructorKey)
  }

  async loadPreviousHash(previousHash?: Uint8Array | string): Promise<this> {
    return await this._signingMutex.runExclusive(async () => {
      if (previousHash) {
        this._previousHash = previousHash ? new Data(32, previousHash) : undefined
      } else {
        const previousHashStoreValue = await Account.previousHashStore?.getItem(this.address)
        if (previousHashStoreValue) {
          this._previousHash = new Data(32, previousHashStoreValue)
        }
      }
      return this
    })
  }

  async sign(hash: DataLike, previousHash: DataLike | undefined): Promise<Uint8Array> {
    await KeyPair.wasmInitialized
    return await this._signingMutex.runExclusive(async () => {
      const currentPreviousHash = this.previousHash
      const passedCurrentHash = typeof previousHash === 'string' ? previousHash : Data.from(previousHash)?.hex
      assertEx(
        currentPreviousHash === passedCurrentHash,
        `Used and current previous hashes do not match [${currentPreviousHash} !== ${passedCurrentHash}]`,
      )

      const signature = this.private.sign(hash)
      this._previousHash = new Data(32, hash)
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.address, this._previousHash.hex)
      }
      return signature
    })
  }

  async verify(msg: DataLike, signature: DataLike): Promise<boolean> {
    await KeyPair.wasmInitialized
    return this.public.address.verify(msg, signature)
  }

  verifyUniqueAddress() {
    const address = this.address
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
