import { BinomialDistributionParameters, calculateBinomialParams } from '../calculateBinomialParams'

describe('calculateBinomialParams', () => {
  const data: [values: number[], outcome: BinomialDistributionParameters][] = [
    [[1, 0], { mean: 1, stdDev: 0.7071067811865476, variance: 0.5 }],
    [[1, 1, 0, 0], { mean: 2, stdDev: 1, variance: 1 }],
  ]
  it.each(data)('calculates the params', (values, outcome) => {
    const result = calculateBinomialParams(values)
    expect(result).toEqual(outcome)
  })
})
