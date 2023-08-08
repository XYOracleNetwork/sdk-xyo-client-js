import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { normalize, Score } from '@xyo-network/crypto-nft-score-model'

const maxScore = 10

export const scoreIndividualAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const { attributes } = info.metrics.metadata
  const scores = Object.entries(attributes)
    .map(([_trait, { values }]) => {
      return Object.entries(values).map<Score>(([_traitValue, metrics]) => {
        const rarity = Math.min(Math.round((1 - metrics.binomial.p) * maxScore), maxScore)
        return [rarity, maxScore]
      })
    })
    .flat()
  const total = scores.reduce<Score>(([a, b], [c, d]) => [a + c, b + d], [0, 0])
  return normalize(total, maxScore)
}
