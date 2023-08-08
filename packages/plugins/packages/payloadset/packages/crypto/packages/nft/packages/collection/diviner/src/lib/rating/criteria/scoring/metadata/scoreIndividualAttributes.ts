import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

export const scoreIndividualAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const { attributes } = info.metrics.metadata
  const scores = Object.entries(attributes)
    .map(([_trait, { values }]) => {
      return Object.entries(values).map<Score>(([_traitValue, metrics]) => {
        const rarity = Math.floor((1 - metrics.binomial.p) * 100)
        return [rarity, 100]
      })
    })
    .flat()
  return scores.reduce<Score>(([a, b], [c, d]) => [a + c, b + d], [0, 0])
}
