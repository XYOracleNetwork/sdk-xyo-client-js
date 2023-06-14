import { Payload } from '@xyo-network/payload-model'

import { EthereumGasEtherscanSchema } from './Schema'

/**
 * https://docs.etherscan.io/api-endpoints/gas-tracker#get-gas-oracle
 */
export interface EthereumGasEtherscanResponse {
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

export type EthereumGasEtherscanPayload = Payload<
  EthereumGasEtherscanResponse & {
    schema: EthereumGasEtherscanSchema
    timestamp: number
  }
>
