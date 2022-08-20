import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEtherchainV1Config = XyoWitnessConfig<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1.config'
}>

export type XyoEthereumGasEtherchainV1Payload = XyoPayload<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v1'
  timestamp: number
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}>
