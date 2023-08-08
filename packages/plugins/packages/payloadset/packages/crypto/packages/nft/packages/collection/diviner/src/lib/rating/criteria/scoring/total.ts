import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

const median = 100000
const defaultMu = Math.log(median)
const defaultSigma = 2
// const mean = Math.exp(defaultMu + Math.pow(defaultSigma, 2) / 2)
const mode = Math.exp(defaultMu - Math.pow(defaultSigma, 2))
// console.log(`mean: ${mean} median: ${median} mode: ${mode}`)

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
// console.log(`mode: ${mode} maxDensity: ${maxProbabilityDensity}`)

export const scoreTotal = (nft: NftCollectionInfo): Score => {
  const density = logNormalProbabilityDensity(nft.total)
  const normalized = density / maxProbabilityDensity
  const score = Math.min(Math.floor(normalized * 10), 10)
  return [score, 10]
}
