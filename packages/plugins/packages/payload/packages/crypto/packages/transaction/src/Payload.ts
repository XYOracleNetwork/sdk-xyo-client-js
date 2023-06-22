import { Payload } from '@xyo-network/payload-model'

import { AddressTransactionHistorySchema } from './Schema'

export interface NftAttribute {
  [key: string]: unknown
  display_type?: unknown
  trait_type?: unknown
  value?: unknown
}

export interface NftInfo {
  contract: string
  metadata?: {
    [key: string]: unknown
    attributes?: NftAttribute[] | unknown
    description?: unknown
    image?: unknown
    name?: unknown
  }
  supply: string
  tokenId: string
  type: string
}

export type AddressTransactionHistoryPayload = Payload<{
  /**
   * The address of the wallet
   */
  address: string
  /**
   * The chain ID for the network (e.g. 1 for Ethereum, 137 for Polygon, etc.)
   */
  chainId: number
  /**
   * A list of NFTs owned by the wallet
   */
  nfts: NftInfo[]
  schema: AddressTransactionHistorySchema
  /**
   * The time at which the data was collected
   */
  timestamp: number
}>
