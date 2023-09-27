import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { bufferPolyfill } from '@xylabs/buffer'
import { staticImplements } from '@xylabs/static-implements'
import { toUint8Array } from '@xyo-network/core'
import { Mnemonic, WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import { generateMnemonic, wordlists } from 'bip39'

import { Account } from './Account'
import { combineWalletPaths, isValidAbsoluteWalletPath, isValidRelativeWalletPath } from './lib'

@staticImplements<WalletStatic>()
export class HDWallet extends Account implements WalletInstance {
  protected static override _addressMap: Record<string, WeakRef<HDWallet>> = {}
  protected static _mnemonicMap: Record<string, WeakRef<HDWallet>> = {}
  protected static _walletMap: Record<string, Record<string, WeakRef<HDWallet>>> = {}
  protected _pathMap: Record<string, WeakRef<HDWallet>> = {}

  constructor(
    key: unknown,
    protected readonly node: HDNode,
  ) {
    //we call this  incase we are in a browser [HDNode needs it]
    bufferPolyfill()
    const privateKey = toUint8Array(node.privateKey.replace('0x', ''))
    assertEx(!privateKey || privateKey?.length === 32, `Private key must be 32 bytes [${privateKey?.length}]`)
    super(key, privateKey ? { privateKey } : undefined)
  }

  override get address(): string {
    return this.node.address.toLowerCase().replace('0x', '')
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

  get mnemonic(): Mnemonic | undefined {
    return this.node.mnemonic
  }

  get parentFingerprint(): string {
    return this.node.parentFingerprint
  }

  get path(): string {
    return this.node.path
  }

  get privateKey(): string {
    return this.node.privateKey
  }

  get publicKey(): string {
    return this.node.publicKey
  }

  static override async create(node: HDNode, previousHash?: string): Promise<HDWallet> {
    const newWallet = await new HDWallet(Account._protectedConstructorKey, node).loadPreviousHash(previousHash)
    return HDWallet._addressMap[newWallet.address]?.deref() ?? newWallet
  }

  static async fromExtendedKey(key: string): Promise<WalletInstance> {
    //we call this  incase we are in a browser [HDNode needs it]
    bufferPolyfill()
    const node = HDNode.fromExtendedKey(key)
    return await HDWallet.create(node)
  }

  static override async fromMnemonic(mnemonic: string): Promise<HDWallet> {
    //we call this  incase we are in a browser [HDNode needs it]
    bufferPolyfill()
    const existing = HDWallet._mnemonicMap[mnemonic]?.deref()
    if (existing) return existing
    const node = HDNode.fromMnemonic(mnemonic)
    const created = await HDWallet.create(node)
    const ref = new WeakRef(created)
    HDWallet._mnemonicMap[mnemonic] = ref
    created._pathMap['m'] = ref
    return created
  }

  static async fromSeed(seed: string | Uint8Array): Promise<HDWallet> {
    //we call this  incase we are in a browser [HDNode needs it]
    bufferPolyfill()
    const node = HDNode.fromSeed(seed)
    return await HDWallet.create(node)
  }

  static override is(value: unknown): HDWallet | undefined {
    return value instanceof HDWallet ? value : undefined
  }

  static random() {
    return this.fromMnemonic(generateMnemonic(256, undefined, wordlists.english))
  }

  protected static getWallet(mnemonic?: Partial<Mnemonic>): HDWallet | undefined {
    const { path, phrase } = mnemonic ?? {}
    if (!phrase || !path) return undefined
    return HDWallet._walletMap[phrase]?.[path]?.deref()
  }

  protected static setWallet(wallet: HDWallet) {
    const { path, phrase } = wallet.mnemonic ?? {}
    if (!phrase || !path) return
    const mnemonicDict = HDWallet._walletMap[phrase] ?? (HDWallet._walletMap[phrase] = {})
    mnemonicDict[path] = new WeakRef(wallet)
  }

  async derivePath(path: string): Promise<HDWallet> {
    const absolutePath = isValidRelativeWalletPath(path) ? combineWalletPaths(this.path, path) : path
    assertEx(isValidAbsoluteWalletPath(absolutePath), `Invalid absolute path ${absolutePath}`)
    const mnemonic = { path: absolutePath, phrase: this.mnemonic?.phrase }
    const existing = HDWallet.getWallet(mnemonic)
    if (existing) return existing
    const created = await HDWallet.create(this.node.derivePath?.(path))
    // If an extended key was used to create the wallet, the path will be null. Otherwise, it should equal the absolute path.
    if (created.path !== null) assertEx(absolutePath === created.path, `Path mismatch ${absolutePath} !== ${created.path}`)
    HDWallet.setWallet(created)
    return created
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}
