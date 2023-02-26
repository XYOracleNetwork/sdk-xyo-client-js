import { DataLike } from '@xyo-network/core'
import { AddressValueModel, KeyPairModel } from '@xyo-network/key-model'

export const ethMessagePrefix = '\x19Ethereum Signed Message:\n'

interface PhraseInitializationConfig {
  phrase: string
}
interface PrivateKeyInitializationConfig {
  privateKey: DataLike
}
interface MnemonicInitializationConfig {
  mnemonic: string
  path?: string
}
interface AccountOptions {
  previousHash?: Uint8Array | string
}

export type InitializationConfig = PhraseInitializationConfig | PrivateKeyInitializationConfig | MnemonicInitializationConfig

export type AccountConfig = InitializationConfig & AccountOptions

export interface AccountModelStatic {
  fromMnemonic(mnemonic: string, path?: string): AccountModel
  fromPhrase(phrase: string): AccountModel
  fromPrivateKey(key: Uint8Array | string): AccountModel
  isXyoWallet(value: unknown): boolean
  random(): AccountModel
}

export interface AccountModel extends KeyPairModel {
  new (opts?: AccountConfig): this
  get addressValue(): AddressValueModel
  get previousHash(): string
  sign(hash: Uint8Array | string): Uint8Array
  verify(msg: Uint8Array | string, signature: Uint8Array | string): boolean
}
