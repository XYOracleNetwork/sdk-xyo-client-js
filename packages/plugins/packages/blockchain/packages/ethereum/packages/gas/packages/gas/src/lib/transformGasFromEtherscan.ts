import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload) => {
  const {
    FastGasPrice,
    LastBlock,
    ProposeGasPrice,
    SafeGasPrice,
    gasUsedRatio: unparsedGasUsedRatio,
    suggestBaseFee: unparsedSuggestBaseFee,
  } = payload
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
