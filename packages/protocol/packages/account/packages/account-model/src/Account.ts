import type { Address, Hash } from '@xylabs/hex'
import { isArrayBuffer } from '@xylabs/lodash'
import type { PrivateKeyInstance, PublicKeyInstance } from '@xyo-network/key-model'
import type { PreviousHashStore } from '@xyo-network/previous-hash-store-model'

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

export const isPhraseInitializationConfig = (value: unknown): value is PhraseInitializationConfig => {
  if (typeof value === 'object' && value !== null) {
    return typeof (value as PhraseInitializationConfig).phrase === 'string'
  }
  return false
}

export const isPrivateKeyInitializationConfig = (value: unknown): value is PrivateKeyInitializationConfig => {
  if (typeof value === 'object' && value !== null) {
    return isArrayBuffer((value as PrivateKeyInitializationConfig).privateKey)
  }
  return false
}

export const isMnemonicInitializationConfig = (value: unknown): value is MnemonicInitializationConfig => {
  if (typeof value === 'object' && value !== null) {
    return (
      typeof (value as MnemonicInitializationConfig).mnemonic === 'string' && typeof ((value as MnemonicInitializationConfig).path ?? '') === 'string'
    )
  }
  return false
}

export const isInitializationConfig = (value: unknown): value is InitializationConfig => {
  return isPhraseInitializationConfig(value) || isPrivateKeyInitializationConfig(value) || isMnemonicInitializationConfig(value)
}

export interface AccountInstance {
  readonly address: Address
  readonly addressBytes: ArrayBuffer
  previousHash: Hash | undefined
  previousHashBytes: ArrayBuffer | undefined
  readonly private: PrivateKeyInstance
  readonly public: PublicKeyInstance
  sign: (hash: ArrayBuffer, previousHash: ArrayBuffer | undefined) => ArrayBuffer | Promise<ArrayBuffer>
  verify: (msg: ArrayBuffer, signature: ArrayBuffer) => boolean | Promise<boolean>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isAccountInstance = (account: any): account is AccountInstance => {
  return typeof account === 'object' && typeof account['address'] === 'string'
}

export interface AccountStatic<T extends AccountInstance = AccountInstance, C extends AccountConfig = AccountConfig> {
  previousHashStore?: PreviousHashStore
  create(options?: C): Promise<T>
  fromPrivateKey(key: ArrayBuffer | string): Promise<AccountInstance>
  random(): Promise<AccountInstance>
}
