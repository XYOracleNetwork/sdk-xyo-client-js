import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasBlocknativeSchema } from './Schema'

export interface EthereumGasBlocknativeResponse {
  message: string
  result: {
    /**
     * Priority Fee
     */
    FastGasPrice: string
    /**
     * Number of last block
     */
    LastBlock: string
    /**
     * Priority Fee
     */
    ProposeGasPrice: string
    /**
     * Priority Fee
     */
    SafeGasPrice: string
    /**
     * Estimate of how busy the network is
     */
    gasUsedRatio: string
    /**
     * The baseFee of the next pending block
     */
    suggestBaseFee: string
  }
  status: string
}

export type XyoEthereumGasBlocknativePayload = XyoPayload<
  EthereumGasBlocknativeResponse & {
    schema: XyoEthereumGasBlocknativeSchema
    timestamp: number
  }
>
