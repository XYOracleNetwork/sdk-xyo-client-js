import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEtherscanSchema } from './Schema'

export interface EthereumGasEtherscanResponse {
  message: string
  result: {
    FastGasPrice: string
    LastBlock: string
    ProposeGasPrice: string
    SafeGasPrice: string
    gasUsedRatio: string
    suggestBaseFee: string
  }
  status: string
}

export type XyoEthereumGasEtherscanPayload = XyoPayload<
  EthereumGasEtherscanResponse & {
    schema: XyoEthereumGasEtherscanSchema
    timestamp: number
  }
>
