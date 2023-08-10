import { NftCollectionCount } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { normalize, Score } from '@xyo-network/crypto-nft-score-model'

const median = 100000
const defaultMu = Math.log(median)
const defaultSigma = 2
const mode = Math.exp(defaultMu - Math.pow(defaultSigma, 2))

/**
 * Calculates the log-normal probability density
 * @param x the value at which you want to calculate the probability density
 * @param mu mean of the associated normal distribution
 * @param sigma standard deviation of the associated normal distribution
 * @returns
 */
const logNormalProbabilityDensity = (x: number, mu: number = defaultMu, sigma: number = defaultSigma): number => {
  if (x <= 0) return 0
  const logX = Math.log(x)
  return (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((logX - mu) / sigma, 2))
}

/**
 * For a lognormal distribution, the peak of the distribution is the mode
 */
const maxProbabilityDensity = logNormalProbabilityDensity(mode)

const maxScore = 10

/**
 * We're working on some assumptions here:
 * - If there's < 1000 NFTs in your collection it starts becoming too niche
 * - If there's > 20,000 NFTs in your collection it starts becoming too broad
 * So there's a sweet spot somewhere between 2000 and 10,000
 * where a collection has enough NFTs to be interesting, but
 * not so many that it's teetering on a diluted money grab.
 * To model that we're using a log-normal distribution optimized
 * to maximally reward collections in the aforementioned range
 * @param nft
 * @returns
 */
export const scoreTotal = (nft: NftCollectionCount): Score => {
  const density = logNormalProbabilityDensity(nft.total)
  const score: Score = [density, maxProbabilityDensity]
  return normalize(score, maxScore)
}
