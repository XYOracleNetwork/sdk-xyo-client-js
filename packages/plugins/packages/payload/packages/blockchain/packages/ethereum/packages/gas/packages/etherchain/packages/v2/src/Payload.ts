import { Payload } from '@xyo-network/payload-model'

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

export type XyoEthereumGasEtherchainV2Payload = Payload<
  EthereumGasEtherchainV2Response & {
    schema: XyoEthereumGasEtherchainV2Schema
    timestamp: number
  }
>
