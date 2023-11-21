import { Data, DataLike } from '@xyo-network/core'
import { KeyPairInstance } from '@xyo-network/key-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import { Mnemonic } from 'ethers'

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
  addressBytes: Data | undefined
  previousHash: string | undefined
  previousHashBytes: Data | undefined
  sign: (hash: DataLike, previousHash: DataLike | undefined) => Uint8Array | Promise<Uint8Array>
  verify: (msg: DataLike, signature: DataLike) => boolean | Promise<boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAccountInstance = (account: any): account is AccountInstance => {
  return typeof account === 'object' && typeof account['address'] === 'string'
}

export interface AccountStatic<T extends AccountInstance = AccountInstance> {
  previousHashStore?: PreviousHashStore
  new (key: unknown, params?: AccountConfig): T
  create(opts?: AccountConfig): Promise<T>
  fromMnemonic(mnemonic: Mnemonic): Promise<T>
  fromPhrase(phrase: string): Promise<AccountInstance>
  fromPrivateKey(key: DataLike): Promise<AccountInstance>
  is(value: unknown): T | undefined
}
