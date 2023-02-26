import { DataLike, XyoData } from '@xyo-network/core'
import { AddressValueModel, KeyPairModel } from '@xyo-network/key-model'

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

export interface AccountModel extends KeyPairModel {
  get addressValue(): AddressValueModel
  get previousHash(): XyoData | undefined
  sign(hash: Uint8Array | string): Uint8Array
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}

export interface AccountModelStatic {
  new (opts?: AccountConfig): AccountModel
  fromMnemonic(mnemonic: string, path?: string): AccountModel
  fromPhrase(phrase: string): AccountModel
  fromPrivateKey(key: Uint8Array | string): AccountModel
  isXyoWallet(value: unknown): boolean
  random(): AccountModel
}
