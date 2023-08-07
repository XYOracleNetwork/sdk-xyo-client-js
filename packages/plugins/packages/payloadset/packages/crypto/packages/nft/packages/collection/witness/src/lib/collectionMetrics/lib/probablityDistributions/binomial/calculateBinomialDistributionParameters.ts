export interface BinomialDistributionParameters {
  mean: number
  stdDev: number
  variance: number
}

export const calculateBinomialDistributionParameters = (outcomes: number[]): BinomialDistributionParameters => {
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
  return { mean, stdDev, variance }
}
