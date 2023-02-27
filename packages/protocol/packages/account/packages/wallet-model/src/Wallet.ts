export interface Mnemonic {
  readonly locale: string
  readonly path: string
  readonly phrase: string
}

export interface WalletInstance {
  address: string
  chainCode: string
  depth: number
  derivePath: (path: string) => WalletInstance
  extendedKey: string
  fingerprint: string
  index: number
  mnemonic: Mnemonic | undefined
  neuter: () => WalletInstance
  parentFingerprint: string
  path: string
  privateKey: string
  publicKey: string
}

export interface WalletStatic {
  fromExtendedKey(key: string): WalletInstance
  fromMnemonic(mnemonic: string): WalletInstance
  fromSeed(seed: string | Uint8Array): WalletInstance
}
