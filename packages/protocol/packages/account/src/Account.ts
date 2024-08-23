import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import {
  Address, Hash, hexFromArrayBuffer,
} from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import { staticImplements } from '@xylabs/static-implements'
import {
  AccountConfig,
  AccountInstance,
  AccountStatic,
  MnemonicInitializationConfig,
  PhraseInitializationConfig,
  PrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import type { PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { Mutex } from 'async-mutex'
import {
  HDNodeWallet, Mnemonic, randomBytes,
} from 'ethers'

import { Elliptic } from './Elliptic.ts'
import { EllipticKey, PrivateKey } from './Key/index.ts'

const nameOf = <T>(name: keyof T) => name

function getPrivateKeyFromMnemonic(mnemonic: Mnemonic, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(mnemonic)
  const wallet = path ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0').toLowerCase()
}

function getPrivateKeyFromPhrase(phrase: string, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase))
  const wallet = path ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0').toLowerCase()
}

@staticImplements<AccountStatic<AccountInstance, AccountConfig>>()
export class Account extends EllipticKey implements AccountInstance {
  static previousHashStore: PreviousHashStore | undefined = undefined
  static readonly uniqueName = globallyUnique('Account', Account, 'xyo')
  protected static _addressMap: Record<string, WeakRef<Account>> = {}
  protected static _protectedConstructorKey = Symbol()
  protected _node: HDNodeWallet | undefined = undefined
  protected _previousHash?: ArrayBuffer

  private readonly _privateKey: PrivateKeyInstance
  private readonly _signingMutex = new Mutex()

  protected constructor(key: unknown, privateKey: PrivateKeyInstance, node?: HDNodeWallet) {
    assertEx(key === Account._protectedConstructorKey, () => 'Do not call this protected constructor')
    super(32, privateKey.bytes)
    this._privateKey = privateKey
    this._node = node
  }

  get address() {
    return this.public.address.hex
  }

  get addressBytes() {
    return this.public.address.bytes
  }

  get previousHash() {
    return this.previousHashBytes ? (hexFromArrayBuffer(this.previousHashBytes, { prefix: false }).toLowerCase() as Hash) : undefined
  }

  get previousHashBytes() {
    return this._previousHash
  }

  get private(): PrivateKeyInstance {
    return this._privateKey
  }

  get public(): PublicKeyInstance {
    return this.private.public
  }

  static async create(opts?: AccountConfig): Promise<AccountInstance> {
    let privateKeyToUse: ArrayBuffer | undefined
    let node: HDNodeWallet | undefined
    if (opts) {
      if (nameOf<PhraseInitializationConfig>('phrase') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(opts.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in opts) {
        privateKeyToUse = toUint8Array(opts.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromMnemonic(Mnemonic.fromPhrase(opts.mnemonic), opts?.path))
        node = opts?.path ? HDNodeWallet.fromPhrase(opts.mnemonic).derivePath?.(opts.path) : HDNodeWallet.fromPhrase(opts.mnemonic)
      }
    }

    privateKeyToUse = privateKeyToUse ?? randomBytes(32)

    return (
      await new Account(Account._protectedConstructorKey, await PrivateKey.create(privateKeyToUse), node).loadPreviousHash(opts?.previousHash)
    ).verifyUniqueAddress()
  }

  static async fromPrivateKey(key: ArrayBuffer | string): Promise<AccountInstance> {
    const privateKey = typeof key === 'string' ? toUint8Array(key.padStart(64, '0')) : key
    return await Account.create({ privateKey })
  }

  static isAddress(address: Address) {
    return address.length === 40
  }

  static async random(): Promise<AccountInstance> {
    return await this.create()
  }

  async initialize(): Promise<this> {
    // TODO: Add initialization of public key and address
    return await Promise.resolve(this)
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
    await Elliptic.initialize()
    return await this._signingMutex.runExclusive(async () => {
      const currentPreviousHash = this.previousHash
      const passedCurrentHash
        = typeof previousHash === 'string'
          ? previousHash
          : previousHash === undefined
            ? undefined
            : hexFromArrayBuffer(previousHash, { prefix: false })
      assertEx(
        currentPreviousHash === passedCurrentHash,
        () => `Used and current previous hashes do not match [${currentPreviousHash} !== ${passedCurrentHash}]`,
      )

      const signature = this.private.sign(hash)
      const newPreviousHash = toUint8Array(hash, 32)
      this._previousHash = newPreviousHash
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.address, hexFromArrayBuffer(newPreviousHash, { prefix: false }))
      }
      return signature
    })
  }

  async verify(msg: ArrayBuffer, signature: ArrayBuffer): Promise<boolean> {
    await Elliptic.initialize()
    return await Elliptic.verify(msg, signature, this.addressBytes)
  }

  verifyUniqueAddress() {
    const address = this.address
    const currentAddressObject = Account._addressMap[address]?.deref()
    if (currentAddressObject === undefined) {
      Account._addressMap[address] = new WeakRef(this)
    } else {
      // assertEx(this === currentAddressObject, `Two Accounts have the same address [${address}]`)
      return currentAddressObject
    }
    return this
  }
}
