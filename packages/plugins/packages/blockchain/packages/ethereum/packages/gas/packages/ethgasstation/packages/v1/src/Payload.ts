import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationV1Schema } from './Schema'

export interface EthereumGasEthgasstationV1Response {
  currentBaseFee: number
  fast: number
  fastest: number
  recommendedBaseFee: number
  safeLow: number
  standard: number
}

export type XyoEthereumGasEthgasstationV1Payload = XyoPayload<
  EthereumGasEthgasstationV1Response & {
    schema: XyoEthereumGasEthgasstationV1Schema
    timestamp: number
  }
>
