import { XyoEthereumGasEtherchainV1Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { BaseFeeRange, GasRange, PriorityFeeRange, TransactionCosts } from '../../Model'

export const transformGasFromEtherchainV1 = (payload: XyoEthereumGasEtherchainV1Payload): TransactionCosts => {
  const { currentBaseFee, fast, fastest, recommendedBaseFee, safeLow, standard } = payload

  const gas: GasRange = {
    high: fast,
    low: safeLow,
    medium: standard,
    veryHigh: fastest,
  }
  const baseFee: BaseFeeRange = {
    medium: currentBaseFee,
  }
  const priorityFee: PriorityFeeRange = {
    medium: Math.max(recommendedBaseFee - currentBaseFee, currentBaseFee),
  }

  return {
    baseFee,
    gas,
    priorityFee,
  }
}
