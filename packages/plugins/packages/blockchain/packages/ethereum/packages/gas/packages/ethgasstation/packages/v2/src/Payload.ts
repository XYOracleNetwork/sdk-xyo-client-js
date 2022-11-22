import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationV2Schema } from './Schema'

export interface EthereumGasEthgasstationV2Response {
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

export type XyoEthereumGasEthgasstationV2Payload = XyoPayload<
  EthereumGasEthgasstationV2Response & {
    schema: XyoEthereumGasEthgasstationV2Schema
    timestamp: number
  }
>
