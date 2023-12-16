import { KeyPairInstance } from '@xyo-network/key-model'
import { PreviousHashStore } from '@xyo-network/previous-hash-store-model'
import type { Mnemonic } from 'ethers'

export const ethMessagePrefix = '\u0019Ethereum Signed Message:\n'

export interface PhraseInitializationConfig {
  phrase: string
}
export interface PrivateKeyInitializationConfig {
  privateKey: ArrayBuffer
}
export interface MnemonicInitializationConfig {
  mnemonic: string
  path?: string
}
export interface AccountOptions {
  previousHash?: ArrayBuffer
}

export type InitializationConfig = PhraseInitializationConfig | PrivateKeyInitializationConfig | MnemonicInitializationConfig

export type AccountConfig = InitializationConfig & AccountOptions

export interface AccountInstance extends KeyPairInstance {
  address: string
  addressBytes: ArrayBuffer | undefined
  previousHash: string | undefined
  previousHashBytes: ArrayBuffer | undefined
  sign: (hash: ArrayBuffer, previousHash: ArrayBuffer | undefined) => ArrayBuffer | Promise<ArrayBuffer>
  verify: (msg: ArrayBuffer, signature: ArrayBuffer) => boolean | Promise<boolean>
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
  fromPrivateKey(key: ArrayBuffer | string): Promise<AccountInstance>
  is(value: unknown): T | undefined
}
