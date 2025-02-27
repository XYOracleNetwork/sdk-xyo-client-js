import type { Hex } from '@xylabs/hex'
import type {
  AccountConfig, AccountInstance, AccountStatic,
} from '@xyo-network/account-model'
import type { Mnemonic } from 'ethers'

export interface WalletInstance extends AccountInstance {
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
  readonly privateKey: Hex
  readonly publicKey: Hex
}

export interface WalletStatic<T extends WalletInstance = WalletInstance> extends Omit<AccountStatic<T>, 'create'> {
  create(config: AccountConfig): Promise<T>
  fromExtendedKey(key: string): Promise<T>
  fromMnemonic(mnemonic: Mnemonic): Promise<T>
  fromPhrase(mnemonic: string, path?: string): Promise<T>
  fromSeed(seed: string | ArrayBufferLike): Promise<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  random(): any
}
