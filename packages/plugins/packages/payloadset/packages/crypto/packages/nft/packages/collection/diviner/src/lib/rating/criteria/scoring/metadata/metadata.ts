import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreMetadata = (metrics: NftCollectionAttributeMetrics): Score => {
  metrics.metrics.metrics.metadata.attributes
  // TODO: Score total attribute
  // TODO: Score individual attribute
  return [1, 1]
}
