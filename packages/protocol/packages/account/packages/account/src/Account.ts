import { toArrayBuffer, toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { globallyUnique } from '@xylabs/base'
import {
  Address,
  asAddress,
  asHash,
  Hash,
  isHash,
  toHex,
} from '@xylabs/hex'
import { staticImplements } from '@xylabs/static-implements'
import { isDefined, isString } from '@xylabs/typeof'
import {
  AccountConfig,
  AccountInstance,
  AccountStatic,
  MnemonicInitializationConfig,
  PhraseInitializationConfig,
  PrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import { Elliptic } from '@xyo-network/elliptic'
import type { PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { Mutex } from 'async-mutex'
import {
  HDNodeWallet, Mnemonic, randomBytes,
} from 'ethers'

import { EllipticKey, PrivateKey } from './Key/index.ts'

const nameOf = <T>(name: keyof T) => name

function getPrivateKeyFromMnemonic(mnemonic: Mnemonic, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(mnemonic)
  const wallet = isString(path) ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0').toLowerCase()
}

function getPrivateKeyFromPhrase(phrase: string, path?: string): string {
  const node = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase))
  const wallet = isString(path) ? node.derivePath?.(path) : node
  return wallet.privateKey.padStart(64, '0').toLowerCase()
}

@staticImplements<AccountStatic<AccountInstance, AccountConfig>>()
export class Account extends EllipticKey implements AccountInstance {
  // eslint-disable-next-line sonarjs/public-static-readonly
  static previousHashStore: PreviousHashStore | undefined = undefined
  static readonly uniqueName = globallyUnique('Account', Account, 'xyo')
  protected static _addressMap: Record<string, WeakRef<AccountInstance>> = {}
  protected static _protectedConstructorKey = Symbol()
  protected _node: HDNodeWallet | undefined = undefined
  protected _previousHash?: ArrayBufferLike

  private readonly _privateKey: PrivateKeyInstance
  private readonly _signingMutex = new Mutex()

  protected constructor(key: unknown, privateKey: PrivateKeyInstance, node?: HDNodeWallet) {
    assertEx(key === Account._protectedConstructorKey, () => 'Do not call this protected constructor')
    super(32, privateKey.bytes)
    this._privateKey = privateKey
    this._node = node
  }

  get address() {
    return asAddress(this.public.address.hex, true)
  }

  get addressBytes() {
    return this.public.address.bytes
  }

  get previousHash() {
    return this.previousHashBytes ? (toHex(this.previousHashBytes, { prefix: false }).toLowerCase() as Hash) : undefined
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
    let privateKeyToUse: Uint8Array | undefined
    let node: HDNodeWallet | undefined
    if (opts) {
      if (nameOf<PhraseInitializationConfig>('phrase') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromPhrase(opts.phrase))
      } else if (nameOf<PrivateKeyInitializationConfig>('privateKey') in opts) {
        privateKeyToUse = toUint8Array(opts.privateKey)
      } else if (nameOf<MnemonicInitializationConfig>('mnemonic') in opts) {
        privateKeyToUse = toUint8Array(getPrivateKeyFromMnemonic(Mnemonic.fromPhrase(opts.mnemonic), opts?.path))
        node = isString(opts?.path) ? HDNodeWallet.fromPhrase(opts.mnemonic).derivePath?.(opts.path) : HDNodeWallet.fromPhrase(opts.mnemonic)
      }
    }

    privateKeyToUse = privateKeyToUse ?? randomBytes(32)

    return (
      await new Account(Account._protectedConstructorKey, await PrivateKey.create(privateKeyToUse.buffer), node).loadPreviousHash(opts?.previousHash)
    ).verifyUniqueAddress()
  }

  static async fromPrivateKey(key: ArrayBufferLike | bigint | string): Promise<AccountInstance> {
    const privateKey = toUint8Array(key, 32)?.buffer
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

  async loadPreviousHash(previousHash?: ArrayBufferLike | string): Promise<this> {
    return await this._signingMutex.runExclusive(async () => {
      if (isDefined(previousHash)) {
        this._previousHash = toUint8Array(previousHash, 32).buffer
      } else {
        const previousHashStoreValue = await Account.previousHashStore?.getItem(this.address)
        if (isHash(previousHashStoreValue)) {
          this._previousHash = toUint8Array(previousHashStoreValue, 32).buffer
        }
      }
      return this
    })
  }

  async sign(hash: ArrayBufferLike, previousHash: ArrayBufferLike | undefined): Promise<[ArrayBufferLike, Hash?]> {
    await Elliptic.initialize()
    return await this._signingMutex.runExclusive(async () => {
      if (Account.previousHashStore) {
        const storedPreviousHash = await Account.previousHashStore.getItem(this.address)
        this._previousHash = isHash(storedPreviousHash) ? toArrayBuffer(storedPreviousHash, 32) : undefined
      }
      const currentPreviousHash = this.previousHash
      const passedCurrentHash
        = previousHash === undefined
          ? this.previousHash
          : toHex(previousHash, { prefix: false })
      assertEx(
        currentPreviousHash === passedCurrentHash,
        () => `Used and current previous hashes do not match [${currentPreviousHash} !== ${passedCurrentHash}]`,
      )

      const signature = await this.private.sign(hash)
      const newPreviousHash = toUint8Array(hash, 32).buffer
      this._previousHash = newPreviousHash
      if (Account.previousHashStore) {
        await Account.previousHashStore.setItem(this.address, asHash(newPreviousHash, true))
      }
      return [signature, currentPreviousHash]
    })
  }

  async verify(msg: ArrayBufferLike, signature: ArrayBufferLike): Promise<boolean> {
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
