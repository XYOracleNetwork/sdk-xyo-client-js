import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

import { BaseFeeRange, GasRange, PriorityFeeRange, TransactionCosts } from '../../Model'

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload): TransactionCosts => {
  const {
    FastGasPrice,
    // LastBlock,
    ProposeGasPrice,
    SafeGasPrice,
    // gasUsedRatio: unparsedGasUsedRatio,
    suggestBaseFee: unparsedSuggestBaseFee,
  } = payload.result
  const fastGasPrice: number = parseInt(FastGasPrice, 10)
  //const lastBlock: number = parseInt(LastBlock, 10)
  const proposeGasPrice: number = parseInt(ProposeGasPrice, 10)
  const safeGasPrice: number = parseInt(SafeGasPrice, 10)
  //const gasUsedRatio: number[] = unparsedGasUsedRatio.split(',').map((x) => parseFloat(x))
  const suggestBaseFee: number = parseFloat(unparsedSuggestBaseFee)

  const gas: GasRange = {
    high: fastGasPrice,
    low: safeGasPrice,
    medium: proposeGasPrice,
    veryHigh: fastGasPrice,
  }
  const baseFee: BaseFeeRange = {
    medium: suggestBaseFee,
  }
  const priorityFee: PriorityFeeRange = {
    medium: suggestBaseFee,
  }
  return {
    baseFee,
    gas,
    priorityFee,
  }
}
