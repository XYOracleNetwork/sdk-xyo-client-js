import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationSchema } from './Schema'

/**
 * https://docs.ethgasstation.io/api-endpoints/gas-tracker#get-gas-oracle
 */
export interface EthereumGasEthgasstationResponse {
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

export type XyoEthereumGasEthgasstationPayload = XyoPayload<
  EthereumGasEthgasstationResponse & {
    schema: XyoEthereumGasEthgasstationSchema
    timestamp: number
  }
>
