import { Data, DataLike } from '@xyo-network/core'
import { AddressValueInstance, KeyPairInstance } from '@xyo-network/key-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

export interface PhraseInitializationConfig {
  phrase: string
}
export interface PrivateKeyInitializationConfig {
  privateKey: DataLike
}
export interface MnemonicInitializationConfig {
  mnemonic: string
  path?: string
}
export interface AccountOptions {
  previousHash?: Uint8Array | string
}

export type InitializationConfig = PhraseInitializationConfig | PrivateKeyInitializationConfig | MnemonicInitializationConfig

export type AccountConfig = InitializationConfig & AccountOptions

export interface AccountInstance extends KeyPairInstance {
  address: string
  derivePath?: (path: string) => Promise<AccountInstance>
  loadPreviousHash: (previousHash?: Uint8Array | string) => Promise<AccountInstance>
  get addressValue(): AddressValueInstance
  get previousHash(): Data | undefined
  sign(hash: Uint8Array | string, previousHash: string | Data | undefined): Uint8Array | Promise<Uint8Array>
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean | Promise<boolean>
  verifyUniqueAddress(): AccountInstance
}

export interface AccountStatic {
  previousHashStore?: PreviousHashStore
  create(opts?: AccountConfig): Promise<AccountInstance>
  fromMnemonic(mnemonic: string, path?: string): Promise<AccountInstance>
  fromPhrase(phrase: string): Promise<AccountInstance>
  fromPrivateKey(key: Uint8Array | string): Promise<AccountInstance>
  isXyoWallet(value: unknown): boolean
  random(): AccountInstance
}
