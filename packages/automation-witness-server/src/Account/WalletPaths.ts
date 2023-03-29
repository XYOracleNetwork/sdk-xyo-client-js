/* eslint-disable sort-keys-fix/sort-keys-fix */

const RootPath = "m/44'/60'" as const

const AutomationPath = {
  CryptoMarket: `${RootPath}/1'` as const,
  EthereumGas: `${RootPath}/2'` as const,
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
      CoingeckoCryptoMarketWitness: `${AutomationPath.CryptoMarket}${ModulePath.Witness}/1` as const,
      UniswapCryptoMarketWitness: `${AutomationPath.CryptoMarket}${ModulePath.Witness}/2` as const,
    } as const,
    Diviner: {
      CryptoMarketAssetDiviner: `${AutomationPath.CryptoMarket}${ModulePath.Diviner}/1` as const,
    } as const,
    AdHocWitness: {
      CryptoMarketAssetDivinerAdHocWitness: `${AutomationPath.CryptoMarket}${ModulePath.AdHocWitness}/1` as const,
    } as const,
    Sentinel: {
      CryptoMarketWitnessPanel: `${AutomationPath.CryptoMarket}${ModulePath.Sentinel}/1` as const,
      CryptoMarketDivinerResultPanel: `${AutomationPath.CryptoMarket}${ModulePath.Sentinel}/2` as const,
    } as const,
  } as const,
  EthereumGas: {
    Witness: {
      EtherchainEthereumGasWitnessV1: `${AutomationPath.EthereumGas}${ModulePath.Witness}/1` as const,
      EtherchainEthereumGasWitnessV2: `${AutomationPath.EthereumGas}${ModulePath.Witness}/2` as const,
      EtherscanEthereumGasWitness: `${AutomationPath.EthereumGas}${ModulePath.Witness}/3` as const,
      EthereumGasBlocknativeWitness: `${AutomationPath.EthereumGas}${ModulePath.Witness}/4` as const,
      EthereumGasEthersWitness: `${AutomationPath.EthereumGas}${ModulePath.Witness}/5` as const,
      EthereumGasEthgasstationWitness: `${AutomationPath.EthereumGas}${ModulePath.Witness}/6` as const,
    } as const,
    Diviner: {
      EthereumGasDiviner: `${AutomationPath.EthereumGas}${ModulePath.Diviner}/1` as const,
    } as const,
    AdHocWitness: {
      DivinerResult: `${AutomationPath.EthereumGas}${ModulePath.AdHocWitness}/1` as const,
    } as const,
    Sentinel: {
      EthereumGasWitnessPanel: `${AutomationPath.EthereumGas}${ModulePath.Sentinel}/1` as const,
      DivinerResult: `${AutomationPath.EthereumGas}${ModulePath.Sentinel}/2` as const,
    } as const,
  } as const,
}
