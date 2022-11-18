import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherchainV1Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { BaseFee, FeeData, FeePerGas, PriorityFeePerGas } from '../../Model'
import { MinPriorityFee } from './PriorityFeeConstants'

const getGasRange = (payload: XyoEthereumGasEtherchainV1Payload): FeePerGas => {
  const { fast, fastest, safeLow, standard } = payload
  const low = parseUnits(safeLow.toString(), 'gwei').toNumber()
  const medium = parseUnits(standard.toString(), 'gwei').toNumber()
  const high = parseUnits(fast.toString(), 'gwei').toNumber()
  const veryHigh = parseUnits(fastest.toString(), 'gwei').toNumber()
  return { high, low, medium, veryHigh }
}

const getBaseFeeRange = (payload: XyoEthereumGasEtherchainV1Payload): BaseFee => {
  const { currentBaseFee } = payload
  const medium = parseUnits(currentBaseFee.toString(), 'gwei').toNumber()
  return { medium }
}

const getPriorityFeeRange = (payload: XyoEthereumGasEtherchainV1Payload): PriorityFeePerGas => {
  const { recommendedBaseFee } = payload
  const low = MinPriorityFee
  const medium = Math.max(parseUnits(recommendedBaseFee.toString(), 'gwei').toNumber(), low)
  return { low, medium }
}

export const transformGasFromEtherchainV1 = (payload: XyoEthereumGasEtherchainV1Payload): FeeData => {
  const gas = getGasRange(payload)
  const baseFee = getBaseFeeRange(payload)
  const priorityFee = getPriorityFeeRange(payload)
  return { baseFee, feePerGas: gas, priorityFeePerGas: priorityFee }
}
