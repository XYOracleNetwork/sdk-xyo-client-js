import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV1Schema } from './Schema'

export type XyoEthereumGasEtherchainV1Payload = XyoPayload<{
  currentBaseFee: number
  fast: number
  fastest: number
  recommendedBaseFee: number
  safeLow: number
  schema: XyoEthereumGasEtherchainV1Schema
  standard: number
  timestamp: number
}>
