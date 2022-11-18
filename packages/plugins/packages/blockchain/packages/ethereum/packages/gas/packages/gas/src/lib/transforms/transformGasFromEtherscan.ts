import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'
import { linear } from 'regression'

import { BaseFee, FeeData, FeePerGas, PriorityFeePerGas } from '../../Model'
import { MinPriorityFee } from './PriorityFeeConstants'

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

const getBaseFeeRange = (payload: XyoEthereumGasEtherscanPayload): Partial<BaseFee> => {
  const { suggestBaseFee } = payload.result
  const medium = parseUnits(suggestBaseFee, 'gwei').toNumber()
  return { medium }
}

const getPriorityFeePerGas = (payload: XyoEthereumGasEtherscanPayload): Partial<PriorityFeePerGas> => {
  const { suggestBaseFee } = payload.result
  const low = MinPriorityFee
  const medium = Math.max(parseUnits(suggestBaseFee, 'gwei').toNumber(), low)
  return { low, medium }
}

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload): FeeData => {
  const feePerGas = getFeePerGas(payload)
  const baseFee = getBaseFeeRange(payload)
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
