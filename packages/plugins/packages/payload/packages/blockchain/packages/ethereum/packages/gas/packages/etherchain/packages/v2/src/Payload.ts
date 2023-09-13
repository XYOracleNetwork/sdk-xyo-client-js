import { Payload } from '@xyo-network/payload-model'

import { EthereumGasEtherchainV2Schema } from './Schema'

export type EthereumGasEtherchainV2Response = {
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

export type EthereumGasEtherchainV2Payload = Payload<
  EthereumGasEtherchainV2Response & {
    timestamp: number
  },
  EthereumGasEtherchainV2Schema
>
