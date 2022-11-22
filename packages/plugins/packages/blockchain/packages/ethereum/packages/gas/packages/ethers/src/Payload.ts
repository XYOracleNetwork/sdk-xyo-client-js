import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthersSchema } from './Schema'

/**
 * https://docs.ethers.io/api-endpoints/gas-tracker#get-gas-oracle
 */
export interface EthereumGasEthersResponse {
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

export type XyoEthereumGasEthersPayload = XyoPayload<
  EthereumGasEthersResponse & {
    schema: XyoEthereumGasEthersSchema
    timestamp: number
  }
>
