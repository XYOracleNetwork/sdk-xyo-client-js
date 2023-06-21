import { HDNode } from '@ethersproject/hdnode'
import { assertEx } from '@xylabs/assert'
import { staticImplements } from '@xylabs/static-implements'
import { AccountInstance } from '@xyo-network/account-model'
import { Mnemonic, WalletStatic } from '@xyo-network/wallet-model'

import { HDAccount } from './HDAccount'

@staticImplements<WalletStatic<HDWallet>>()
export class HDWallet extends HDAccount implements AccountInstance {
  override get address(): string {
    assertEx(super.address === this.node.address, 'Address consistency failure')
    return this.node.address
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

  static override async create(node: HDNode): Promise<HDWallet> {
    return await new HDWallet(node).verifyUniqueAddress().loadPreviousHash()
  }

  static async fromExtendedKey(key: string): Promise<HDWallet> {
    const node = HDNode.fromExtendedKey(key)
    return await HDWallet.create(node)
  }

  static override async fromMnemonic(mnemonic: string): Promise<HDWallet> {
    const node = HDNode.fromMnemonic(mnemonic)
    return await HDWallet.create(node)
  }

  static async fromSeed(seed: string | Uint8Array): Promise<HDWallet> {
    const node = HDNode.fromSeed(seed)
    return await HDWallet.create(node)
  }

  /**
   * @deprecated Use derivePath instead as HDWallet now implements AccountInstance
   */
  async deriveAccount(path: string): Promise<AccountInstance> {
    return await this.derivePath(path)
  }

  async derivePath(path: string): Promise<HDWallet> {
    return await HDWallet.create(this.node.derivePath(path))
  }

  neuter: () => HDWallet = () => {
    this.node.neuter()
    return this
  }
}
