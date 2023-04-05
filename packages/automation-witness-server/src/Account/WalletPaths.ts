/* eslint-disable sort-keys-fix/sort-keys-fix */

const RootPath = "m/44'/60'" as const

const AutomationPath = {
  CryptoMarket: `${RootPath}/1'` as const,
  EthereumGas: `${RootPath}/2'` as const,
  Node: `${RootPath}/3'` as const,
}

const ModulePath = {
  AdHocWitness: "/1'" as const,
  Diviner: "/2'" as const,
  Sentinel: "/3'" as const,
  Witness: "/4'" as const,
}

export const WalletPaths = {
  CryptoMarket: {
    Witness: {
      Coingecko: `${AutomationPath.CryptoMarket}${ModulePath.Witness}/1` as const,
      Uniswap: `${AutomationPath.CryptoMarket}${ModulePath.Witness}/2` as const,
    } as const,
    Diviner: {
      Asset: `${AutomationPath.CryptoMarket}${ModulePath.Diviner}/1` as const,
    } as const,
    AdHocWitness: {
      AssetDivinerResult: `${AutomationPath.CryptoMarket}${ModulePath.AdHocWitness}/1` as const,
    } as const,
    Sentinel: {
      Market: `${AutomationPath.CryptoMarket}${ModulePath.Sentinel}/1` as const,
      AssetDivinerResult: `${AutomationPath.CryptoMarket}${ModulePath.Sentinel}/2` as const,
    } as const,
  } as const,
  EthereumGas: {
    Witness: {
      EtherchainV1: `${AutomationPath.EthereumGas}${ModulePath.Witness}/1` as const,
      EtherchainV2: `${AutomationPath.EthereumGas}${ModulePath.Witness}/2` as const,
      Etherscan: `${AutomationPath.EthereumGas}${ModulePath.Witness}/3` as const,
      Blocknative: `${AutomationPath.EthereumGas}${ModulePath.Witness}/4` as const,
      Ethers: `${AutomationPath.EthereumGas}${ModulePath.Witness}/5` as const,
      Ethgasstation: `${AutomationPath.EthereumGas}${ModulePath.Witness}/6` as const,
    } as const,
    Diviner: {
      Price: `${AutomationPath.EthereumGas}${ModulePath.Diviner}/1` as const,
    } as const,
    AdHocWitness: {
      PriceDivinerResult: `${AutomationPath.EthereumGas}${ModulePath.AdHocWitness}/1` as const,
    } as const,
    Sentinel: {
      Gas: `${AutomationPath.EthereumGas}${ModulePath.Sentinel}/1` as const,
      PriceDivinerResult: `${AutomationPath.EthereumGas}${ModulePath.Sentinel}/2` as const,
    } as const,
  } as const,
}
