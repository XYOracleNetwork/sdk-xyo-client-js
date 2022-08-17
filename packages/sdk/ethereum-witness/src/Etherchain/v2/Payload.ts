import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherchainQueryPayloadV2 = XyoQueryPayload<{
  schema: 'network.xyo.blockchain.ethereum.gas.etherchain.v2.query'
}>

export type XyoEthereumGasEtherchainPayloadV2 = XyoPayload<{
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
