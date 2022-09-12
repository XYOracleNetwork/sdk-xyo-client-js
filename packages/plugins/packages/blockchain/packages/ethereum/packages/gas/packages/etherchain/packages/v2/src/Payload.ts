import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV2Schema } from './Schema'

export type XyoEthereumGasEtherchainV2Payload = XyoPayload<{
  schema: XyoEthereumGasEtherchainV2Schema
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
