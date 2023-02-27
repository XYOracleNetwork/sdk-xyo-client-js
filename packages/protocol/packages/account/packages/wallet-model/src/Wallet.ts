// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WalletInstance {
  //TODO:
}

export interface WalletStatic {
  fromExtendedKey(key: string): WalletInstance
  fromMnemonic(mnemonic: string): WalletInstance
  fromSeed(seed: string | Uint8Array): WalletInstance
}
