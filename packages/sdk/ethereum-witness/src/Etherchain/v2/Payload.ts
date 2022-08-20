import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoEthereumGasEtherchainV2Config = XyoWitnessConfig<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.config'
}>

export type XyoEthereumGasEtherchainV2Payload = XyoPayload<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2'
  code: number
  data: {
    fast: number
    priceUSD: number
    rapid: number
    slow: number
    standard: number
    timestamp: number
  }
}>
