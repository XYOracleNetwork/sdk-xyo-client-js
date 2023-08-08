import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreIndividualAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const { values } = info.metrics.metrics.metadata.attributes
  const scores = Object.entries(values.values).map<Score>(([_, metrics]) => {
    const rarity = 1 - metrics.binomial.p
    return [rarity * 100, 100]
  })
  return scores.reduce<Score>(([a, b], [c, d]) => [a + c, b + d], [0, 0])
}
