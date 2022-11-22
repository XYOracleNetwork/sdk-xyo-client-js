import { XyoPayload } from '@xyo-network/payload'

import { XyoEthereumGasEthersSchema } from './Schema'

/**
 * https://docs.ethers.io/api-endpoints/gas-tracker#get-gas-oracle
 */
export interface EthereumGasEthersResponse {
  gasPrice: null | number
  lastBaseFeePerGas: null | number
  maxFeePerGas: null | number
  maxPriorityFeePerGas: null | number
}

export type XyoEthereumGasEthersPayload = XyoPayload<
  EthereumGasEthersResponse & {
    schema: XyoEthereumGasEthersSchema
    timestamp: number
  }
>
