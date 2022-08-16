import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoEthereumGasEtherscanQueryPayloadSchema = 'network.xyo.blockchain.ethereum.gas.etherscan.query'
export const XyoEthereumGasEtherscanQueryPayloadSchema = 'network.xyo.blockchain.ethereum.gas.etherscan.query'

export type XyoEthereumGasEtherscanQueryPayload = XyoQueryPayload<{
  schema: XyoEthereumGasEtherscanQueryPayloadSchema
  targetSchema: XyoEthereumGasEtherscanPayloadSchema
}>

export type XyoEthereumGasEtherscanPayloadSchema = 'network.xyo.blockchain.ethereum.gas.etherscan'
export const XyoEthereumGasEtherscanPayloadSchema = 'network.xyo.blockchain.ethereum.gas.etherscan'

export type XyoEthereumGasEtherscanPayload = XyoPayload<{
  schema: XyoEthereumGasEtherscanPayloadSchema
  timestamp: number
  lastBlock: number
  safeGasPrice: number
  proposeGasPrice: number
  fastGasPrice: number
  suggestBaseFee: number
  gasUsedRatio: number[]
}>
