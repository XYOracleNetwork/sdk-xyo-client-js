import { BinomialDistributionParameters } from '../BinomialDistributionParameters'
import { calculateBinomialParamsFromOutcomes } from '../calculateBinomialParamsFromOutcomes'

describe('calculateBinomialParams', () => {
  const data: [values: number[], outcome: BinomialDistributionParameters][] = [
    [[1, 0], { mean: 1, p: 0.5, stdDev: 0.7071067811865476, variance: 0.5 }],
    [[1, 1, 0, 0], { mean: 2, p: 0.5, stdDev: 1, variance: 1 }],
    [[1, 0, 0, 0], { mean: 1, p: 0.25, stdDev: 0.8660254037844386, variance: 0.75 }],
    [[1, 1, 1, 1], { mean: 4, p: 1, stdDev: 0, variance: 0 }],
    [[0, 0, 0, 0], { mean: 0, p: 0, stdDev: 0, variance: 0 }],
  ]
  it.each(data)('calculates the params', (values, outcome) => {
    const result = calculateBinomialParamsFromOutcomes(values)
    expect(result).toEqual(outcome)
  })
})
