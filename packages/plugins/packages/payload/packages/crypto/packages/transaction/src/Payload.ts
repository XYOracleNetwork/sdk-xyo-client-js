import { Payload } from '@xyo-network/payload-model'

import { AddressTransactionHistorySchema } from './Schema'

export type AccessList = {
  address: string
  storageKeys: string[]
}[]

export interface Transaction {
  /**
   * EIP-2930; Type 1 & EIP-1559; Type 2
   */
  accessList?: AccessList
  blockHash?: string
  /**
   * The block number of the transaction if mined
   */
  blockNumber?: number
  chainId: number
  confirmations: number
  data: string
  from: string
  gasLimit: string
  gasPrice?: string
  hash: string
  maxFeePerGas?: string
  /**
   * EIP-1559; Type 2
   */
  maxPriorityFeePerGas?: string
  nonce: number
  r?: string
  /**
   * The raw transaction
   */
  raw?: string
  s?: string
  timestamp?: number
  to?: string
  /**
   * Typed-Transaction features
   */
  type?: number | null
  v?: number
  value: string
}

export type AddressTransactionHistoryPayload = Payload<
  Transaction & {
    schema: AddressTransactionHistorySchema
  }
>
