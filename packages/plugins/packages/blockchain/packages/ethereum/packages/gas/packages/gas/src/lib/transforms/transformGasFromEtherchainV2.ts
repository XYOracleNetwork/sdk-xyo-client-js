import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherchainV2Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { BaseFee, FeeData, FeePerGas, PriorityFeePerGas } from '../../Model'
import { MinPriorityFee } from './PriorityFeeConstants'

const getGasRange = (payload: XyoEthereumGasEtherchainV2Payload): Partial<FeePerGas> => {
  const { slow, standard, fast, rapid } = payload.data
  const low = parseUnits(slow.toString(), 'wei').toNumber()
  const medium = parseUnits(standard.toString(), 'wei').toNumber()
  const high = parseUnits(fast.toString(), 'wei').toNumber()
  const veryHigh = parseUnits(rapid.toString(), 'wei').toNumber()
  return { high, low, medium, veryHigh }
}

const getBaseFeeRange = (payload: XyoEthereumGasEtherchainV2Payload): Partial<BaseFee> => {
  const medium = parseUnits('0', 'wei').toNumber()
  return { medium }
}

const getPriorityFeeRange = (payload: XyoEthereumGasEtherchainV2Payload): Partial<PriorityFeePerGas> => {
  const low = MinPriorityFee
  const medium = Math.max(parseUnits('0', 'wei').toNumber(), low)
  return { low, medium }
}

export const transformGasFromEtherchainV2 = (payload: XyoEthereumGasEtherchainV2Payload): FeeData => {
  const gas = getGasRange(payload)
  const baseFee = getBaseFeeRange(payload)
  const priorityFee = getPriorityFeeRange(payload)
  return { baseFee, feePerGas: gas, priorityFeePerGas: priorityFee }
}
