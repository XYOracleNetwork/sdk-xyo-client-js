import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherscanQueryPayload = XyoQueryPayload

export interface XyoEthereumGasEtherscanPayload extends XyoPayload {
  timestamp: number
  lastBlock: number
  safeGasPrice: number
  proposeGasPrice: number
  fastGasPrice: number
  suggestBaseFee: number
  gasUsedRatio: number[]
}
