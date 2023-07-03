import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { generateMnemonic, wordlists } from '@xyo-network/bip39'
import { toUint8Array } from '@xyo-network/core'
import { Mnemonic, WalletInstance, WalletStatic } from '@xyo-network/wallet-model'

import { Account } from './Account'

@staticImplements<WalletStatic>()
export class HDWallet extends Account implements WalletInstance {
  protected static override _addressMap: Record<string, WeakRef<HDWallet>> = {}
  protected static _mnemonicMap: Record<string, WeakRef<HDWallet>> = {}
  protected static _walletMap: Record<string, Record<string, WeakRef<HDWallet>>> = {}
  protected _pathMap: Record<string, WeakRef<HDWallet>> = {}

  constructor(key: unknown, protected readonly node: HDNode) {
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
    const node = HDNode.fromExtendedKey(key)
    return await HDWallet.create(node)
  }

  static override async fromMnemonic(mnemonic: string): Promise<HDWallet> {
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
    const node = HDNode.fromSeed(seed)
    return await HDWallet.create(node)
  }

  static override is(value: unknown): HDWallet | undefined {
    return value instanceof HDWallet ? value : undefined
  }

  static random() {
    return this.fromMnemonic(generateMnemonic(wordlists.english, 256))
  }

  protected static getWallet(mnemonic?: string, path?: string): HDWallet | undefined {
    if (!mnemonic || !path) return undefined
    return HDWallet._walletMap[mnemonic]?.[path]?.deref()
  }

  protected static setWallet(mnemonic?: string, path?: string, wallet?: HDWallet) {
    if (!mnemonic || !path || !wallet) return undefined
    const mnemonicDict = HDWallet._walletMap[mnemonic] ?? (HDWallet._walletMap[mnemonic] = {})
    assertEx(isValidAbsolutePath(path), `Invalid absolute path ${path}`)
    mnemonicDict[path] = new WeakRef(wallet)
  }

  async derivePath(path: string): Promise<HDWallet> {
    assertEx(isValidRelativePath(path), `Invalid relative path ${path}`)
    const absolutePath = combinePaths(this.path, path)
    assertEx(isValidAbsolutePath(absolutePath), `Invalid absolute path ${absolutePath}`)
    const existing = HDWallet.getWallet(this.mnemonic, absolutePath)
    if (existing) return existing
    const created = await HDWallet.create(this.node.derivePath?.(path))
    assertEx(absolutePath === created.path, `Path mismatch ${absolutePath} !== ${created.path}`)
    HDWallet.setWallet(this.mnemonic, absolutePath, created)
    return created
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}

const pathSegmentRegex = /^[0-9]+[']?$/

const isValidAbsolutePath = (path?: string): boolean => {
  if (!path) return false
  if (!path.startsWith('m')) return false
  const parts = path.split('/')
  // If any empty parts, return invalid
  if (parts.some((p) => !p)) return false
  if (parts.every((p) => pathSegmentRegex.test(p))) return true
  return false
}

const isValidRelativePath = (path: string): boolean => {
  const formatted = formatPath(path)
  return formatted.length > 0 && formatted[0] !== 'm'
}

const formatPath = (path: string) => {
  return path
    .trimStart()
    .trimEnd()
    .split('/')
    .filter((p) => p)
    .join('/')
}

const combinePaths = (path1: string, path2: string) => {
  const parts1 = formatPath(path1).split('/')
  const parts2 = formatPath(path2).split('/')
  return parts1.concat(parts2).join('/')
}
