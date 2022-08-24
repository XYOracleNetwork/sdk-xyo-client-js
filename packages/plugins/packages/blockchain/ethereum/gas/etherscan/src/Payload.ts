import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherscanPayloadSchema } from './Schema'

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
