import { Payload } from '@xyo-network/payload-model'

import { CryptoWalletNftSchema } from './Schema'

export interface NftInfo {
  contract: string
  name: string | null
  symbol: string | null
  tokenType: string
}

export type CryptoWalletNftPayload = Payload<{
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
  schema: CryptoWalletNftSchema
  /**
   * The time at which the data was collected
   */
  timestamp: number
}>
