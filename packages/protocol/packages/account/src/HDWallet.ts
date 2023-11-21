import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { toUint8Array } from '@xyo-network/core'
import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import { generateMnemonic, wordlists } from 'bip39'
import { HDNodeWallet, Mnemonic } from 'ethers'

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
    protected readonly node: HDNodeWallet,
  ) {
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

  get mnemonic(): Mnemonic | null {
    return this.node.mnemonic
  }

  get parentFingerprint(): string {
    return this.node.parentFingerprint
  }

  get path(): string {
    return this.node.path ? `${this.node.path}` : "m/44'/60'"
  }

  get privateKey(): string {
    return this.node.privateKey
  }

  get publicKey(): string {
    return this.node.publicKey
  }

  static override async create(node: HDNodeWallet, previousHash?: string): Promise<HDWallet> {
    const newWallet = await new HDWallet(Account._protectedConstructorKey, node).loadPreviousHash(previousHash)
    return HDWallet._addressMap[newWallet.address]?.deref() ?? newWallet
  }

  static async fromExtendedKey(key: string): Promise<WalletInstance> {
    const node = HDNodeWallet.fromExtendedKey(key)
    /* TODO: Handle HDNodeVoidWallet */
    return await HDWallet.create(node as HDNodeWallet)
  }

  static override async fromMnemonic(mnemonic: Mnemonic, path?: string): Promise<HDWallet> {
    const node = HDNodeWallet.fromMnemonic(mnemonic, path)
    return await HDWallet.create(node)
    /*
    let existing = HDWallet._mnemonicMap[mnemonic.phrase]?.deref()
    if (existing) {
      if (path) {
        const derivedNode = existing._pathMap[path]?.deref()
        if (derivedNode) {
          return derivedNode
        }
      } else {
        return existing
      }
    } else {
      const node = HDNodeWallet.fromMnemonic(mnemonic)
      existing = await HDWallet.create(node)
      const ref = new WeakRef(existing)
      HDWallet._mnemonicMap[mnemonic.phrase] = ref
      existing._pathMap['m'] = ref
      if (path) {
        const derivedNode = await existing.derivePath(path)
        const ref = new WeakRef(derivedNode)
        existing._pathMap[path] = ref
        return derivedNode
      }
    }
    return existing
    */
  }

  static override async fromPhrase(phrase: string, path?: string) {
    return await this.fromMnemonic(Mnemonic.fromPhrase(phrase), path)
  }

  static async fromSeed(seed: string | Uint8Array): Promise<HDWallet> {
    const node = HDNodeWallet.fromSeed(seed)
    return await HDWallet.create(node)
  }

  static override is(value: unknown): HDWallet | undefined {
    return value instanceof HDWallet ? value : undefined
  }

  static random() {
    return this.fromMnemonic(Mnemonic.fromPhrase(generateMnemonic(256, undefined, wordlists.english)))
  }

  protected static getWallet(phrase?: string, path: string = ''): HDWallet | undefined {
    if (!phrase || !path) return undefined
    return HDWallet._walletMap[phrase]?.[path]?.deref()
  }

  protected static setWallet(wallet: HDWallet, path: string = '') {
    const phrase = wallet.mnemonic?.phrase
    if (!phrase) return
    const mnemonicDict = HDWallet._walletMap[phrase] ?? (HDWallet._walletMap[phrase] = {})
    mnemonicDict[path] = new WeakRef(wallet)
  }

  async derivePath(path: string): Promise<HDWallet> {
    return await HDWallet.create(this.node.derivePath(path))
    /*
    //console.log(`derivePath: ${path}`)
    const absolutePath = isValidRelativeWalletPath(path) ? combineWalletPaths(this.path, path) : path
    //console.log(`absolutePath: ${absolutePath}`)
    assertEx(isValidAbsoluteWalletPath(absolutePath), `Invalid absolute path ${absolutePath}`)
    const existing = HDWallet.getWallet(this.mnemonic?.phrase, absolutePath)
    //if (existing) console.log(`existing: ${existing.path}`)
    if (existing) return existing
    //console.log(`this.node: ${this.node.path}`)
    const created = await HDWallet.create(this.node.derivePath?.(path))
    //console.log(`createdPath: ${created.path}`)
    // If an extended key was used to create the wallet, the path will be null. Otherwise, it should equal the absolute path.
    if (created.path !== null) assertEx(absolutePath === created.path, `Path mismatch ${absolutePath} !== ${created.path}`)
    HDWallet.setWallet(created)
    return created
    */
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}
