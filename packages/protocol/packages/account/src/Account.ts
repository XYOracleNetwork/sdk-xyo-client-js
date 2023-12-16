import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { hexFromArrayBuffer, toHexLegacy } from '@xylabs/hex'
import { staticImplements } from '@xylabs/static-implements'
import {
  AccountConfig,
  AccountInstance,
  AccountStatic,
  MnemonicInitializationConfig,
  PhraseInitializationConfig,
  PrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { Mutex } from 'async-mutex'
import { HDNodeWallet, Mnemonic, randomBytes } from 'ethers'

import { KeyPair } from './Key'

export const ethMessagePrefix = '\u0019Ethereum Signed Message:\n'

const nameOf = <T>(name: keyof T) => name

function getPrivateKeyFromMnemonic(mnemonic: Mnemonic, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(mnemonic)
  const wallet = path ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0')
}

function getPrivateKeyFromPhrase(phrase: string, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase))
  const wallet = path ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0')
}

@staticImplements<AccountStatic>()
export class Account extends KeyPair implements AccountInstance {
  static previousHashStore: PreviousHashStore | undefined = undefined
  protected static _addressMap: Record<string, WeakRef<Account>> = {}
  protected static _protectedConstructorKey = Symbol()
  protected _node: HDNodeWallet | undefined = undefined
  protected _previousHash?: ArrayBuffer
  private readonly _signingMutex = new Mutex()

  constructor(key: unknown, params?: AccountConfig) {
    assertEx(key === Account._protectedConstructorKey, 'Do not call this protected constructor')
    let privateKeyToUse: ArrayBuffer | undefined
    let node: HDNodeWallet | undefined
    if (params) {
      if (nameOf<PhraseInitializationConfig>('phrase') in params) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(params.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in params) {
        privateKeyToUse = toUint8Array(params.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in params) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromMnemonic(Mnemonic.fromPhrase(params.mnemonic), params?.path))
        node = params?.path ? HDNodeWallet.fromPhrase(params.mnemonic).derivePath?.(params.path) : HDNodeWallet.fromPhrase(params.mnemonic)
      }
    }
    assertEx(!privateKeyToUse || privateKeyToUse?.byteLength === 32, `Private key must be 32 bytes [${privateKeyToUse?.byteLength}]`)
    super(privateKeyToUse)
    this._node = node
  }

  get address() {
    return hexFromArrayBuffer(this.addressBytes, { prefix: false })
  }

  get addressBytes() {
    return this.public.address.bytes
  }

  get previousHash() {
    return this.previousHashBytes ? toHexLegacy(this.previousHashBytes) : undefined
  }

  get previousHashBytes() {
    return this._previousHash
  }

  static async create(opts?: AccountConfig): Promise<AccountInstance> {
    return (await new Account(Account._protectedConstructorKey, opts).loadPreviousHash(opts?.previousHash)).verifyUniqueAddress() as AccountInstance
  }

  static async fromMnemonic(mnemonic: Mnemonic): Promise<AccountInstance> {
    return await Account.fromPrivateKey(typeof mnemonic === 'string' ? getPrivateKeyFromMnemonic(mnemonic) : getPrivateKeyFromMnemonic(mnemonic))
  }

  static async fromPhrase(phrase: string): Promise<AccountInstance> {
    return await Account.fromPrivateKey(getPrivateKeyFromMnemonic(Mnemonic.fromPhrase(phrase)))
  }

  static async fromPrivateKey(key: ArrayBuffer | string): Promise<AccountInstance> {
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
    return new Account(Account._protectedConstructorKey, { privateKey: randomBytes(32) })
  }

  async loadPreviousHash(previousHash?: ArrayBuffer | string): Promise<this> {
    return await this._signingMutex.runExclusive(async () => {
      if (previousHash) {
        this._previousHash = previousHash ? toUint8Array(previousHash, 32) : undefined
      } else {
        const previousHashStoreValue = await Account.previousHashStore?.getItem(this.address)
        if (previousHashStoreValue) {
          this._previousHash = toUint8Array(previousHashStoreValue, 32)
        }
      }
      return this
    })
  }

  async sign(hash: ArrayBuffer, previousHash: ArrayBuffer | undefined): Promise<ArrayBuffer> {
    await KeyPair.wasmInitialized
    return await this._signingMutex.runExclusive(async () => {
      const currentPreviousHash = this.previousHash
      const passedCurrentHash = typeof previousHash === 'string' ? previousHash : previousHash === undefined ? undefined : toHexLegacy(previousHash)
      assertEx(
        currentPreviousHash === passedCurrentHash,
        `Used and current previous hashes do not match [${currentPreviousHash} !== ${passedCurrentHash}]`,
      )

      const signature = this.private.sign(hash)
      const newPreviousHash = toUint8Array(hash, 32)
      this._previousHash = newPreviousHash
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.address, toHexLegacy(newPreviousHash))
      }
      return signature
    })
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
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
