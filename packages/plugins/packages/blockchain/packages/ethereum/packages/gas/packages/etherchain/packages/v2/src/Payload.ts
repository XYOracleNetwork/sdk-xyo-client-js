import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV2Schema } from './Schema'

export interface EthereumGasEtherchainV2Response {
  code: number
  data: {
    fast: number
    priceUSD: number
    rapid: number
    slow: number
    standard: number
    timestamp: number
  }
}

export type XyoEthereumGasEtherchainV2Payload = XyoPayload<
  EthereumGasEtherchainV2Response & {
    schema: XyoEthereumGasEtherchainV2Schema
  }
>
