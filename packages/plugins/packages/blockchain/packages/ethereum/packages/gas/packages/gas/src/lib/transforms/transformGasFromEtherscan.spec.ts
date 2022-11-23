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
      baseFee: 27.616709247,
      feePerGas: {
        low: 28,
        medium: 29,
        high: 30,
        veryHigh: 31,
      },
      priorityFeePerGas: {},
    })
  })
})
