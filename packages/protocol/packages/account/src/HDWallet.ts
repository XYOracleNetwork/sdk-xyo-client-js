import { generateMnemonic } from '@scure/bip39'
// eslint-disable-next-line import/no-internal-modules
import { wordlist } from '@scure/bip39/wordlists/english'
import { toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { hexFromHexString } from '@xylabs/hex'
import { staticImplements } from '@xylabs/static-implements'
import { AccountConfig } from '@xyo-network/account-model'
import { WalletInstance, WalletStatic } from '@xyo-network/wallet-model'
import { HDNodeWallet, Mnemonic } from 'ethers'

import { Account } from './Account'
//import { combineWalletPaths, isValidAbsoluteWalletPath, isValidRelativeWalletPath } from './lib'

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

  get path(): string {
    return this.node.path ? `${this.node.path}` : "m/44'/60'"
  }

  get privateKey(): string {
    return this.node.privateKey
  }

  get publicKey(): string {
    return this.node.publicKey
  }

  static override async create(_opts?: AccountConfig): Promise<WalletInstance> {
    await Promise.resolve()
    throw Error('Not implemented')
  }

  static async createFromNode(node: HDNodeWallet, previousHash?: string): Promise<HDWallet> {
    const newWallet = await new HDWallet(Account._protectedConstructorKey, node).loadPreviousHash(previousHash)
    return HDWallet._addressMap[newWallet.address]?.deref() ?? newWallet
  }

  static async fromExtendedKey(key: string): Promise<WalletInstance> {
    const node = HDNodeWallet.fromExtendedKey(key)
    /* TODO: Handle HDNodeVoidWallet */
    return await HDWallet.createFromNode(node as HDNodeWallet)
  }

  static override async fromMnemonic(mnemonic: Mnemonic, path = "m/44'/60'"): Promise<HDWallet> {
    let existing = HDWallet._mnemonicMap[mnemonic.phrase]?.deref()
    if (existing) {
      if (path) {
        const existingDerivedNode = existing._pathMap[path]?.deref()
        if (existingDerivedNode) {
          console.log(`fromMnemonic1: [${path}][${existingDerivedNode.path}]`)
          return existingDerivedNode
        }
      } else {
        console.log(`fromMnemonic2: [${path}][${existing.path}]`)
        return existing
      }
    }

    const node = HDNodeWallet.fromMnemonic(mnemonic)
    existing = await HDWallet.createFromNode(node)
    const ref = new WeakRef(existing)
    HDWallet._mnemonicMap[mnemonic.phrase] = ref
    if (path) {
      const derivedNode = await existing.derivePath(path)
      const ref = new WeakRef(derivedNode)
      existing._pathMap[path] = ref
      console.log(`fromMnemonic3: [${path}][${derivedNode.path}]`)
      return derivedNode
    }
    console.log(`fromMnemonic4: [${path}][${existing.path}]`)
    return existing
  }

  static override async fromPhrase(phrase: string, path?: string) {
    return await this.fromMnemonic(Mnemonic.fromPhrase(phrase), path)
  }

  static async fromSeed(seed: string | Uint8Array): Promise<HDWallet> {
    const node = HDNodeWallet.fromSeed(seed)
    return await HDWallet.createFromNode(node)
  }

  static override is(value: unknown): HDWallet | undefined {
    return value instanceof HDWallet ? value : undefined
  }

  static random() {
    return this.fromMnemonic(Mnemonic.fromPhrase(generateMnemonic(wordlist, 256)))
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
    return await HDWallet.createFromNode(this.node.derivePath(path))
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
