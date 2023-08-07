import { NftCollectionMetrics } from './NftCollectionMetrics'

export interface NftCollectionInfo {
  address: string
  chainId: number
  metrics: NftCollectionMetrics
  name: string
  symbol: string
  tokenType: string
  total: number
}
