import { XyoEthereumGasEtherchainV1Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { FeeData, PriorityFeePerGas } from '../../Model'

const getBaseFee = (payload: XyoEthereumGasEtherchainV1Payload): number | undefined => {
  const { currentBaseFee } = payload
  return currentBaseFee
}

const getPriorityFeePerGas = (payload: XyoEthereumGasEtherchainV1Payload): Partial<PriorityFeePerGas> => {
  const { fast, fastest, safeLow, standard } = payload
  const low = safeLow
  const medium = standard
  const high = fast
  const veryHigh = fastest
  return { high, low, medium, veryHigh }
}

export const transformGasFromEtherchainV1 = (payload: XyoEthereumGasEtherchainV1Payload): FeeData => {
  const baseFee = getBaseFee(payload)
  const feePerGas = {}
  const priorityFeePerGas = getPriorityFeePerGas(payload)
  return { baseFee, feePerGas, priorityFeePerGas }
}
