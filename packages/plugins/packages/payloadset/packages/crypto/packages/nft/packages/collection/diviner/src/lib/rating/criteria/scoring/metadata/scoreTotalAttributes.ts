import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreTotalAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const { metrics } = info.metrics.metrics.metadata.attributes
  const rarity = 1 - metrics.metrics.binomial.p
  return [rarity * 100, 100]
}
