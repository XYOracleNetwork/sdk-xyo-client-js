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

/**
 * Calculates the Gaussian probability density
 * @param x
 * @param mu Mean
 * @param sigma Standard Deviation
 * @returns
 */
const gaussianProbabilityDensity = (x: number, mu: number = defaultMu, sigma: number = defaultSigma): number => {
  const sqrtTwoPi = Math.sqrt(2 * Math.PI)
  const denominator = sigma * sqrtTwoPi
  const power = -0.5 * Math.pow((x - mu) / sigma, 2)
  return (1 / denominator) * Math.exp(power)
}

/**
 * For a Gaussian distribution, the peak of the distribution is the mean
 */
const maxProbabilityDensity = gaussianProbabilityDensity(defaultMu)

/**
 * We're working on some assumptions here:
 *
 * - If you have a 100% chance of getting a trait, everyone get's a trophy
 * - If you have a 50% chance of getting a trait, it's not rare
 * - If you have a 0% chance of getting a trait, it's not fun
 *
 * So we're looking for something Pareto-ish (somewhere between
 * 80/20 or 90/10) as that's a good & sustainable model for the
 * distribution of many traits in real life.
 * However, we also don't want to maximally reward collections
 * that have a lot of single attributes distributed uniformly
 * (basically a 0% trait probably) as that's perfectly entropic
 * but not very interesting (some overlap is desirable).
 * So we're using a Gaussian distribution to model the
 * probability density of the joint probability of all traits
 * centered around 15%.
 * @param info
 * @returns
 */
export const scoreTotalAttributes = (info: NftCollectionAttributeMetrics): Score => {
  const { attributes } = info.metrics.metadata
  // This has somewhat of a filtering function by causing anything with 100% probability to
  // add no value to the end score
  const jointProbability = Object.entries(attributes).reduce((acc, [_trait, { metrics }]) => {
    return acc * metrics.binomial.p
  }, 1)
  const probabilityDensity = gaussianProbabilityDensity(jointProbability)
  const score: Score = [probabilityDensity, maxProbabilityDensity]
  return normalize(score, maxScore)
}
