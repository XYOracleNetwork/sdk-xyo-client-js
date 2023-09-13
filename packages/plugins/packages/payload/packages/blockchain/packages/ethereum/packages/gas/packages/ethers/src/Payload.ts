import { Serializable } from '@xyo-network/object'
import { Payload } from '@xyo-network/payload-model'

import { EthereumGasEthersSchema } from './Schema'

/**
 * https://docs.ethers.io/v5/api/providers/types/#providers-FeeData
 */
export type EthereumGasEthersResponse = {
  /**
   * The gasPrice to use for legacy transactions or networks which do
   * not support EIP-1559.
   */
  gasPrice: null | number
  lastBaseFeePerGas: null | number
  /**
   * The maxFeePerGas to use for a transaction. This is based on the
   * most recent block's baseFee.
   */
  maxFeePerGas: null | number
  /**
   * The maxPriorityFeePerGas to use for a transaction. This accounts
   * for the uncle risk and for the majority of current MEV risk
   */
  maxPriorityFeePerGas: null | number
}

export type EthereumGasEthersPayload = Payload<
  EthereumGasEthersResponse & {
    schema: EthereumGasEthersSchema
    timestamp: number
  }
>
