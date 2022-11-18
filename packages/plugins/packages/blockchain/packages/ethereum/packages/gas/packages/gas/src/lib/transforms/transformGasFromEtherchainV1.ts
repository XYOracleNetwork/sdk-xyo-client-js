import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherchainV1Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { FeeData, PriorityFeePerGas } from '../../Model'

const getBaseFee = (payload: XyoEthereumGasEtherchainV1Payload): number | undefined => {
  const { currentBaseFee } = payload
  return parseUnits(currentBaseFee.toString(), 'gwei').toNumber()
}

const getPriorityFeePerGas = (payload: XyoEthereumGasEtherchainV1Payload): Partial<PriorityFeePerGas> => {
  const { fast, fastest, safeLow, standard } = payload
  const low = parseUnits(safeLow.toString(), 'gwei').toNumber()
  const medium = parseUnits(standard.toString(), 'gwei').toNumber()
  const high = parseUnits(fast.toString(), 'gwei').toNumber()
  const veryHigh = parseUnits(fastest.toString(), 'gwei').toNumber()
  return { high, low, medium, veryHigh }
}

export const transformGasFromEtherchainV1 = (payload: XyoEthereumGasEtherchainV1Payload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = {}
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
