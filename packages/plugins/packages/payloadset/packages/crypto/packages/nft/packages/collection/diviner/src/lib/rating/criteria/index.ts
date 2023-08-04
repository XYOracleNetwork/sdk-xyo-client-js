import { NftCollectionInfo } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'
import {} from 'simple-statistics'

/**
 * Calculates the log-normal probability density
 * @param x the value at which you want to calculate the probability density
 * @param mu mean of the associated normal distribution
 * @param sigma standard deviation of the associated normal distribution
 * @returns
 */
function logNormalDensity(x: number, mu: number = 1000, sigma: number = 0.5): number {
  if (x <= 0) {
    throw new Error('x must be greater than 0')
  }

  const logX = Math.log(x)
  return (1 / (x * sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((logX - mu) / sigma, 2))
}

const scoreTotal = async (nft: NftCollectionInfo): Promise<Score> => {
  const score = Math.max(Math.floor(logNormalDensity(nft.total) * 100), 100)
  return await Promise.resolve([score, 100])
}

export const scoringCriteria = {
  total: { score: scoreTotal, weight: 1 },
}
