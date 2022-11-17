import { XyoEthereumGasEtherchainV2Payload } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { BaseFeeRange, GasRange, PriorityFeeRange, TransactionCosts } from '../../Model'

export const transformGasFromEtherchainV2 = (payload: XyoEthereumGasEtherchainV2Payload): TransactionCosts => {
  const { fast, rapid, slow, standard } = payload.data

  const gas: GasRange = {
    high: fast,
    low: slow,
    medium: standard,
    veryHigh: rapid,
  }
  const baseFee: BaseFeeRange = {
    medium: 0,
  }
  const priorityFee: PriorityFeeRange = {
    medium: 0,
  }

  return {
    baseFee,
    gas,
    priorityFee,
  }
}
