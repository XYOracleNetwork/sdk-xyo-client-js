import { BinomialDistributionParameters } from './BinomialDistributionParameters'

/**
 * Calculates the parameters of a binomial distribution given a list of outcomes
 * @param outcomes List of outcomes, where 1 is a success and 0 is a failure
 * @returns The mean, standard deviation, and variance of the binomial distribution
 */
export const calculateBinomialParamsFromOutcomes = (outcomes: number[]): BinomialDistributionParameters => {
  const n = outcomes.length
  // Calculate p: the proportion of successes
  const sum = outcomes.reduce((acc, value) => acc + value, 0)
  const p = sum / n
  // Mean (µ)
  const mean = n * p
  // Variance (σ^2)
  const variance = n * p * (1 - p)
  // Standard Deviation (σ)
  const stdDev = Math.sqrt(variance)
  return { mean, p, stdDev, variance }
}
