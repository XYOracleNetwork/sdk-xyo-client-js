import { DataLike, XyoData } from '@xyo-network/core'
import { AddressValueInstance, KeyPairInstance } from '@xyo-network/key-model'

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
  get addressValue(): AddressValueInstance
  get previousHash(): XyoData | undefined
  sign(hash: Uint8Array | string): Uint8Array | Promise<Uint8Array>
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface AccountStatic {
  new (opts?: AccountConfig): AccountInstance
  fromMnemonic(mnemonic: string, path?: string): AccountInstance
  fromPhrase(phrase: string): AccountInstance
  fromPrivateKey(key: Uint8Array | string): AccountInstance
  isXyoWallet(value: unknown): boolean
  random(): AccountInstance
}
