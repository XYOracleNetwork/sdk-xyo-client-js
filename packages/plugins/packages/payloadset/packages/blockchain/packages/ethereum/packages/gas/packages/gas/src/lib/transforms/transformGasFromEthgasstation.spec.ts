/* eslint-disable sort-keys-fix/sort-keys-fix */
import { sampleEthgasstationGas } from '../../test'
import { transformGasFromEthgasstation } from './transformGasFromEthgasstation'

describe('transformGasFromEthgasstation', () => {
  it('returns values in the expected format', () => {
    const result = transformGasFromEthgasstation(sampleEthgasstationGas)
    expect(result).toBeObject()
    expect(result.baseFee).toBeNumber()
    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeNumber()
    expect(result.feePerGas.medium).toBeNumber()
    expect(result.feePerGas.high).toBeNumber()
    expect(result.feePerGas.veryHigh).toBeNumber()
    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeNumber()
    expect(result.priorityFeePerGas.medium).toBeNumber()
    expect(result.priorityFeePerGas.high).toBeNumber()
    expect(result.priorityFeePerGas.veryHigh).toBeNumber()
  })
  it('matches expected output', () => {
    const result = transformGasFromEthgasstation(sampleEthgasstationGas)
    expect(result).toMatchObject({
      baseFee: 10,
      feePerGas: {
        low: 11.33,
        medium: 12,
        high: 12,
        veryHigh: 13,
      },
      priorityFeePerGas: {
        low: 2,
        medium: 2,
        high: 2,
        veryHigh: 2,
      },
    })
  })
})
