import { parseUnits } from '@ethersproject/units'
import { XyoEthereumGasEtherchainV2Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { FeeData, FeePerGas } from '../../Model'

const getFeePerGas = (payload: XyoEthereumGasEtherchainV2Payload): Partial<FeePerGas> => {
  const { slow, standard, fast, rapid } = payload.data
  const low = parseUnits(slow.toString(), 'wei').toNumber()
  const medium = parseUnits(standard.toString(), 'wei').toNumber()
  const high = parseUnits(fast.toString(), 'wei').toNumber()
  const veryHigh = parseUnits(rapid.toString(), 'wei').toNumber()
  return { high, low, medium, veryHigh }
}

export const transformGasFromEtherchainV2 = (payload: XyoEthereumGasEtherchainV2Payload): FeeData => {
  const baseFee = undefined
  const feePerGas = getFeePerGas(payload)
  const priorityFeePerGas = {}
  return { baseFee, feePerGas, priorityFeePerGas }
}
