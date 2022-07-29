export interface EtherscanGasPriceResult {
  status: string
  message: string
  result: {
    LastBlock: string
    SafeGasPrice: string
    ProposeGasPrice: string
    FastGasPrice: string
    suggestBaseFee: string
    gasUsedRatio: string
  }
}
