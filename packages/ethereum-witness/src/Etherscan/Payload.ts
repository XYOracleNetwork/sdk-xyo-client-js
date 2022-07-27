import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherscanQueryPayload = XyoQueryPayload

export interface XyoEthereumGasEtherscanPayload extends XyoPayload {
  schema: 'network.xyo.blockchain.ethereum.gas.etherscan'
  timestamp: number
  lastBlock: number
  safeGasPrice: number
  proposeGasPrice: number
  fastGasPrice: number
  suggestBaseFee: number
  gasUsedRatio: number[]
}
