import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationSchema } from './Schema'

export interface EthereumGasEthgasstationResponse {
  baseFee: number
  blockNumber: number
  blockTime: number
  gasPrice: {
    fast: number
    instant: number
    standard: number
  }
  nextBaseFee: number
  priorityFee: {
    fast: number
    instant: number
    standard: number
  }
}

export type XyoEthereumGasEthgasstationPayload = XyoPayload<
  EthereumGasEthgasstationResponse & {
    schema: XyoEthereumGasEthgasstationSchema
    timestamp: number
  }
>
