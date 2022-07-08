import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherscanQueryPayload = XyoQueryPayload

export interface XyoEthereumGasEtherscanPayload extends XyoPayload {
  timestamp: number
  LastBlock: number
  SafeGasPrice: number
  ProposeGasPrice: number
  FastGasPrice: number
  suggestBaseFee: number
  gasUsedRatio: number[]
}
