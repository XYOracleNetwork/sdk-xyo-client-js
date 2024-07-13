import { generateMnemonic } from '@scure/bip39'
// eslint-disable-next-line import/no-internal-modules
import { wordlist as englishWordlist } from '@scure/bip39/wordlists/english'
import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { Address, Hex, hexFromHexString } from '@xylabs/hex'
import { globallyUnique } from '@xylabs/object'
import { staticImplements } from '@xylabs/static-implements'
import {
  AccountConfig,
  isMnemonicInitializationConfig,
  isPhraseInitializationConfig,
  isPrivateKeyInitializationConfig,
} from '@xyo-network/account-model'
import type { PrivateKeyInstance } from '@xyo-network/key-model'
import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import { defaultPath, HDNodeWallet, Mnemonic } from 'ethers'

import { Account } from './Account.js'
import { PrivateKey } from './Key/index.js'

@staticImplements<WalletStatic>()
export class HDWallet extends Account implements WalletInstance {
  static override readonly uniqueName = globallyUnique('HDWallet', HDWallet, 'xyo')
  protected static override _addressMap: Record<Address, WeakRef<HDWallet>> = {}

  constructor(
    key: unknown,
    protected readonly node: HDNodeWallet,
    privateKey: PrivateKeyInstance,
  ) {
    super(Account._protectedConstructorKey, privateKey)
  }

  override get address(): Address {
    return hexFromHexString(this.node.address, { prefix: false })
  }

  override get addressBytes(): ArrayBuffer {
    return toUint8Array(this.address, undefined, 16)
  }

  get chainCode(): string {
    return this.node.chainCode
  }

  get depth(): number {
    return this.node.depth
  }

  get extendedKey(): string {
    return this.node.extendedKey
  }

  get fingerprint(): string {
    return this.node.fingerprint
  }

  get index(): number {
    return this.node.index
  }

  get mnemonic(): Mnemonic | null {
    return this.node.mnemonic
  }

  get parentFingerprint(): string {
    return this.node.parentFingerprint
  }

  get path(): string | null {
    return this.node.path
  }

  get privateKey(): Hex {
    return this.node.privateKey.toLowerCase() as Hex
  }

  get publicKey(): Hex {
    return this.node.publicKey.toLowerCase() as Hex
  }

  static override async create(opts?: AccountConfig): Promise<WalletInstance> {
    if (isPhraseInitializationConfig(opts)) {
      return await this.fromPhrase(opts.phrase)
    }
    if (isMnemonicInitializationConfig(opts)) {
      return await this.fromPhrase(opts.mnemonic, opts.path)
    }
    if (isPrivateKeyInitializationConfig(opts)) {
      throw new Error('Invalid initialization config. from privateKey not supported.  Use Account.fromPrivateKey instead.')
    }
    throw new Error('Invalid initialization config')
  }

  static async createFromNode(node: HDNodeWallet, previousHash?: string): Promise<WalletInstance> {
    return await this.createFromNodeInternal(node, previousHash)
  }

  static async fromExtendedKey(key: string): Promise<WalletInstance> {
    const node = HDNodeWallet.fromExtendedKey(key)
    /* TODO: Handle HDNodeVoidWallet */
    return await HDWallet.createFromNode(node as HDNodeWallet)
  }

  static async fromMnemonic(mnemonic: Mnemonic, path: string = defaultPath): Promise<WalletInstance> {
    const node = HDNodeWallet.fromMnemonic(mnemonic, path)
    const createdWallet = await this.createFromNodeInternal(node)
    return this.getCachedWalletOrCacheNewWallet(createdWallet)
  }

  static async fromPhrase(phrase: string, path: string = defaultPath): Promise<WalletInstance> {
    return await this.fromMnemonic(Mnemonic.fromPhrase(phrase), path)
  }

  static async fromSeed(seed: string | Uint8Array): Promise<WalletInstance> {
    const node = HDNodeWallet.fromSeed(seed)
    const createdWallet = await this.createFromNodeInternal(node)
    return this.getCachedWalletOrCacheNewWallet(createdWallet)
  }

  static generateMnemonic(wordlist: string[] = englishWordlist, strength: number = 256): string {
    return generateMnemonic(wordlist, strength)
  }

  static override async random(): Promise<WalletInstance> {
    return await this.fromMnemonic(Mnemonic.fromPhrase(HDWallet.generateMnemonic()))
  }

  protected static async createFromNodeInternal(node: HDNodeWallet, previousHash?: string): Promise<HDWallet> {
    const privateKey = toUint8Array(node.privateKey.replace('0x', ''))
    assertEx(!privateKey || privateKey?.length === 32, () => `Private key must be 32 bytes [${privateKey?.length}]`)
    const newWallet = await new HDWallet(Account._protectedConstructorKey, node, await PrivateKey.create(privateKey)).loadPreviousHash(previousHash)
    return HDWallet._addressMap[newWallet.address]?.deref() ?? newWallet
  }

  protected static getCachedWalletOrCacheNewWallet(createdWallet: HDWallet): HDWallet {
    const existingWallet = this._addressMap[createdWallet.address]?.deref()
    if (existingWallet) {
      return existingWallet
    }
    const ref = new WeakRef(createdWallet)
    this._addressMap[createdWallet.address] = ref
    return createdWallet
  }

  async derivePath(path: string): Promise<WalletInstance> {
    //if an absolute path, check if it matches the parent root and work with it
    if (path.startsWith('m/')) {
      const parentPath = this.path
      if (parentPath !== null && path.startsWith(parentPath)) {
        const childPath = path.slice(parentPath.length + 1)
        return await HDWallet.createFromNode(this.node.derivePath(childPath))
      }
      throw new Error(`Invalid absolute path ${path} for wallet with path ${parentPath}`)
    }
    return await HDWallet.createFromNode(this.node.derivePath(path))
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}
