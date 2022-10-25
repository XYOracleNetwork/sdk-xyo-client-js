export interface EtherscanGasPriceResult {
  message: string

  result: {
    FastGasPrice: string
    LastBlock: string
    ProposeGasPrice: string
    SafeGasPrice: string
    gasUsedRatio: string
    suggestBaseFee: string
  }
  status: string
}
