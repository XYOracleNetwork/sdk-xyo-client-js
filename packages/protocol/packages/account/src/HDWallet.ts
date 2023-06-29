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

  static override async create(node: HDNode, previousHash?: string): Promise<WalletInstance> {
    const newWallet = await new HDWallet(Account._protectedConstructorKey, node).loadPreviousHash(previousHash)
    return HDWallet._addressMap[newWallet.address]?.deref() ?? newWallet
  }

  static async fromExtendedKey(key: string): Promise<WalletInstance> {
    const node = HDNode.fromExtendedKey(key)
    return await HDWallet.create(node)
  }

  static override async fromMnemonic(mnemonic: string): Promise<WalletInstance> {
    const node = HDNode.fromMnemonic(mnemonic)
    return await HDWallet.create(node)
  }

  static async fromSeed(seed: string | Uint8Array): Promise<WalletInstance> {
    const node = HDNode.fromSeed(seed)
    return await HDWallet.create(node)
  }

  static override is(value: unknown): HDWallet | undefined {
    return value instanceof HDWallet ? value : undefined
  }

  static random() {
    return this.fromMnemonic(generateMnemonic(wordlists.english, 256))
  }

  async derivePath(path: string): Promise<WalletInstance> {
    return await HDWallet.create(this.node.derivePath?.(path))
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}
