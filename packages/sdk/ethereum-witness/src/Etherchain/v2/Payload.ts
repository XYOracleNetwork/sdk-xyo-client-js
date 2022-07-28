import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherchainQueryPayloadV2 = XyoQueryPayload

export interface XyoEthereumGasEtherchainPayloadV2 extends XyoPayload {
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
}
