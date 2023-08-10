import { NftCollectionAttributeMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { normalize, Score } from '@xyo-network/crypto-nft-score-model'

const maxScore = 10

/**
 * Mean: What value is the distribution centered around
 */
const defaultMu = 0.15

/**
 * Standard Deviation: How spread out is the distribution
 */
const defaultSigma = 0.1

const gaussianProbabilityDensity = (x: number, mu: number = defaultMu, sigma: number = defaultSigma): number => {
  const sqrtTwoPi = Math.sqrt(2 * Math.PI)
  const denominator = sigma * sqrtTwoPi
  const power = -0.5 * Math.pow((x - mu) / sigma, 2)
  return (1 / denominator) * Math.exp(power)
}

export const scoreTotalAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const values = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0].map((v) => [
    v,
    gaussianProbabilityDensity(v),
  ])
  const { attributes } = info.metrics.metadata
  const allProbabilites = Object.entries(attributes).map(([_trait, { metrics }]) => metrics.binomial.p)
  // This has somewhat of a filtering function by causing anything with 100% probability to
  // adds no value to the end score
  const jointProbability = Object.entries(attributes).reduce((acc, [_trait, { metrics }]) => {
    return acc * metrics.binomial.p
  }, 1)
  const probabilityDensity = gaussianProbabilityDensity(jointProbability)
  const scores = Object.entries(attributes).map<Score>(([_trait, { metrics }]) => {
    const rarity = Math.floor((1 - metrics.binomial.p) * 100)
    return [rarity, 100]
  })
  const total = scores.reduce<Score>(([a, b], [c, d]) => [a + c, b + d], [0, 0])
  return normalize(total, maxScore)
}
