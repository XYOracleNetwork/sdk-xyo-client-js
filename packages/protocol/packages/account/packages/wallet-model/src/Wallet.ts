import { AccountInstance, AccountStatic } from '@xyo-network/account-model'
import type { HDNodeWallet, Mnemonic } from 'ethers'

export interface WalletInstance extends AccountInstance {
  readonly address: string
  readonly chainCode: string
  readonly depth: number
  readonly derivePath: (path: string) => Promise<WalletInstance>
  readonly extendedKey: string
  readonly fingerprint: string
  readonly index: number
  readonly mnemonic?: Mnemonic | null
  readonly neuter: () => WalletInstance
  readonly parentFingerprint: string
  readonly path: string | null
  readonly privateKey: string
  readonly publicKey: string
}

export interface WalletStatic<T extends WalletInstance = WalletInstance> extends Omit<AccountStatic<T>, 'new'> {
  new (key: unknown, node: HDNodeWallet): T
  fromExtendedKey(key: string): Promise<T>
  fromMnemonic(mnemonic: Mnemonic): Promise<T>
  fromPhrase(mnemonic: string, path?: string): Promise<T>
  fromSeed(seed: string | ArrayBuffer): Promise<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  random(): any
}
