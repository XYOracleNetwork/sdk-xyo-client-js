/* eslint-disable sort-keys-fix/sort-keys-fix */
import { sampleEtherscanGas } from '../../test'
import { transformGasFromEtherscan } from './transformGasFromEtherscan'

describe('transformGasFromEtherscan', () => {
  it('returns values in the expected format', () => {
    const result = transformGasFromEtherscan(sampleEtherscanGas)
    expect(result).toBeObject()
    expect(result.baseFee).toBeNumber()
    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeNumber()
    expect(result.feePerGas.medium).toBeNumber()
    expect(result.feePerGas.high).toBeNumber()
    expect(result.feePerGas.veryHigh).toBeNumber()
    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeUndefined()
    expect(result.priorityFeePerGas.medium).toBeUndefined()
    expect(result.priorityFeePerGas.high).toBeUndefined()
    expect(result.priorityFeePerGas.veryHigh).toBeUndefined()
  })
  it('matches expected output', () => {
    const result = transformGasFromEtherscan(sampleEtherscanGas)
    expect(result).toMatchObject({
      baseFee: 27616709247,
      feePerGas: {
        low: 28000000000,
        medium: 29000000000,
        high: 30000000000,
        veryHigh: 31000000000,
      },
      priorityFeePerGas: {},
    })
  })
})
