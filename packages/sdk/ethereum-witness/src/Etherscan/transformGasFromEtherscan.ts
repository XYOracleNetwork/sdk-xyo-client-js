import { EtherscanGasPriceResult } from './EtherscanGasPriceResult'

export const transformGasFromEtherscan = (response: EtherscanGasPriceResult) => {
  const {
    FastGasPrice,
    LastBlock,
    ProposeGasPrice,
    SafeGasPrice,
    gasUsedRatio: unparsedGasUsedRatio,
    suggestBaseFee: unparsedSuggestBaseFee,
  } = response.result
  const fastGasPrice: number = parseInt(FastGasPrice, 10)
  const lastBlock: number = parseInt(LastBlock, 10)
  const proposeGasPrice: number = parseInt(ProposeGasPrice, 10)
  const safeGasPrice: number = parseInt(SafeGasPrice, 10)
  const gasUsedRatio: number[] = unparsedGasUsedRatio.split(',').map((x) => parseFloat(x))
  const suggestBaseFee: number = parseFloat(unparsedSuggestBaseFee)
  return {
    fastGasPrice,
    gasUsedRatio,
    lastBlock,
    proposeGasPrice,
    safeGasPrice,
    suggestBaseFee,
  }
}
