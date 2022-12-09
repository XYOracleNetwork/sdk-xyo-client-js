import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { FeeData, FeePerGas } from '@xyo-network/gas-price-payload-plugin'
import { linear } from 'regression'

const getBaseFee = (payload: XyoEthereumGasEtherscanPayload): number | undefined => {
  const { suggestBaseFee } = payload.result
  return parseFloat(suggestBaseFee)
}

const getFeePerGas = (payload: XyoEthereumGasEtherscanPayload): Partial<FeePerGas> => {
  const { FastGasPrice, ProposeGasPrice, SafeGasPrice } = payload.result
  const low = parseFloat(SafeGasPrice)
  const medium = parseFloat(ProposeGasPrice)
  const high = parseFloat(FastGasPrice)
  const veryHigh = linear([
    [0, low],
    [1, medium],
    [2, high],
  ]).predict(3)[1]
  return { high, low, medium, veryHigh }
}

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = {}
  return { baseFee, feePerGas, priorityFeePerGas }
}
