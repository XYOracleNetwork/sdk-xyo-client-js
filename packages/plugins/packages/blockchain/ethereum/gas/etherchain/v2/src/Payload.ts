import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV2PayloadSchema } from './Schema'

export type XyoEthereumGasEtherchainV2Payload = XyoPayload<{
  schema: XyoEthereumGasEtherchainV2PayloadSchema
  code: number
  data: {
    fast: number
    priceUSD: number
    rapid: number
    slow: number
    standard: number
    timestamp: number
  }
}>
