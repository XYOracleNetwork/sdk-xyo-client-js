import { Payload } from '@xyo-network/payload-model'

import { AddressTransactionHistorySchema } from './Schema'

export interface Transaction {
  accessList: null
  blockHash: string
  blockNumber: number
  chainId: number
  confirmations: number
  creates: null
  data: string
  from: string
  gasLimit: string
  gasPrice: string
  hash: string
  nonce: 57
  timestamp: number
  to: string
  transactionIndex: number
  type: 0
  value: string
}

export type AddressTransactionHistoryPayload = Payload<{
  /**
   * The address of the account
   */
  address: string
  /**
   * The chain ID for the network (e.g. 1 for Ethereum, 137 for Polygon, etc.)
   */
  chainId: number
  /**
   * A list of Transaction by the account
   */
  nfts: Transaction[]
  schema: AddressTransactionHistorySchema
  /**
   * The time at which the data was collected
   */
  timestamp: number
}>
