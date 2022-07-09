import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherchainQueryPayloadV2 = XyoQueryPayload

export interface XyoEthereumGasEtherchainPayloadV2 extends XyoPayload {
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
