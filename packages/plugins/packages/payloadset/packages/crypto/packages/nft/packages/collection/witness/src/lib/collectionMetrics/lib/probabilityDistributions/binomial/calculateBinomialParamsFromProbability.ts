import { BinomialDistributionParameters } from './BinomialDistributionParameters'

/**
 * Calculates the parameters of a binomial distribution given the number of trials and success probability
 * @param n Number of trials
 * @param p Success probability
 * @returns The binomial distribution parameters
 */
export const calculateBinomialParamsFromProbability = (n: number, p: number): BinomialDistributionParameters => {
  // Mean (µ)
  const mean = n * p

  // Variance (σ^2)
  const variance = n * p * (1 - p)

  // Standard Deviation (σ)
  const stdDev = Math.sqrt(variance)

  return { mean, p, stdDev, variance }
}
