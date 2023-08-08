import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreTotalAttributes = (_attribute: NftCollectionAttributeMetrics): Score => {
  return [0, 1]
}
