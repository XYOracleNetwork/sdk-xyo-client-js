import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV1Schema } from './Schema'

export type XyoEthereumGasEtherchainV1Payload = XyoPayload<{
  schema: XyoEthereumGasEtherchainV1Schema
  timestamp: number
  safeLow: number
  standard: number
  fast: number
  fastest: number
  currentBaseFee: number
  recommendedBaseFee: number
}>
