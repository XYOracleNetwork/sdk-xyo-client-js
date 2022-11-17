import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV1Schema } from './Schema'

export interface EthereumGasEtherchainV1Response {
  currentBaseFee: number
  fast: number
  fastest: number
  recommendedBaseFee: number
  safeLow: number
  standard: number
}

export type XyoEthereumGasEtherchainV1Payload = XyoPayload<
  EthereumGasEtherchainV1Response & {
    schema: XyoEthereumGasEtherchainV1Schema
    timestamp: number
  }
>
