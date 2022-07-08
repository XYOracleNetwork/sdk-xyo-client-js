import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherchainQueryPayload = XyoQueryPayload

export interface XyoEthereumGasEtherchainPayload extends XyoPayload {
  timestamp: number
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}
