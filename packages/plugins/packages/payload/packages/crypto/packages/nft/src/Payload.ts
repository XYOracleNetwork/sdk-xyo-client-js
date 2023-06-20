import { Payload } from '@xyo-network/payload-model'

import { CryptoWalletNftSchema } from './Schema'


export interface NftInfo {
  contract: string,
  tokenType: string,
  name: string,
  symbol: string
}

export type CryptoWalletNftPayload = Payload<{
  /**
   * The address of the wallet
   */
  address: string
  /**
   * The chain (e.g. Ethereum, Polygon, etc.) the NFT is listed on
   */
  network: string
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
