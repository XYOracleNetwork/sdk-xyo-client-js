import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { linear } from 'regression'

import { FeeData, FeePerGas } from '../../Model'

const getFeePerGas = (payload: XyoEthereumGasEtherscanPayload): Partial<FeePerGas> => {
  const { FastGasPrice, ProposeGasPrice, SafeGasPrice } = payload.result
  const low = parseUnits(SafeGasPrice, 'gwei').toNumber()
  const medium = parseUnits(ProposeGasPrice, 'gwei').toNumber()
  const high = parseUnits(FastGasPrice, 'gwei').toNumber()
  // Use linear regression to calculate very high range
  const veryHigh = linear([
    [0, low],
    [1, medium],
    [2, high],
  ]).predict(3)[1]
  return { high, low, medium, veryHigh }
}

const getBaseFee = (payload: XyoEthereumGasEtherscanPayload): number | undefined => {
  const { suggestBaseFee } = payload.result
  return parseUnits(suggestBaseFee, 'gwei').toNumber()
}

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = {}
  return { baseFee, feePerGas, priorityFeePerGas }
}
