import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherscanPayload } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

import { BaseFeeRange, GasRange, PriorityFeePerGas, TransactionCosts } from '../../Model'
import { MinPriorityFee } from './PriorityFeeConstants'

const getGasRange = (payload: XyoEthereumGasEtherscanPayload): GasRange => {
  const { FastGasPrice, ProposeGasPrice, SafeGasPrice } = payload.result
  const low = parseUnits(SafeGasPrice, 'gwei').toNumber()
  const medium = parseUnits(ProposeGasPrice, 'gwei').toNumber()
  const high = parseUnits(FastGasPrice, 'gwei').toNumber()
  const veryHigh = parseUnits(FastGasPrice, 'gwei').toNumber()
  return { high, low, medium, veryHigh }
}

const getBaseFeeRange = (payload: XyoEthereumGasEtherscanPayload): BaseFeeRange => {
  const { suggestBaseFee } = payload.result
  const medium = parseUnits(suggestBaseFee, 'gwei').toNumber()
  return { medium }
}

const getPriorityFeeRange = (payload: XyoEthereumGasEtherscanPayload): PriorityFeePerGas => {
  const { suggestBaseFee } = payload.result
  const low = MinPriorityFee
  const medium = Math.max(parseUnits(suggestBaseFee, 'gwei').toNumber(), low)
  return { low, medium }
}

export const transformGasFromEtherscan = (payload: XyoEthereumGasEtherscanPayload): TransactionCosts => {
  const gas = getGasRange(payload)
  const baseFee = getBaseFeeRange(payload)
  const priorityFee = getPriorityFeeRange(payload)
  return { baseFee, gas, priorityFee }
}
