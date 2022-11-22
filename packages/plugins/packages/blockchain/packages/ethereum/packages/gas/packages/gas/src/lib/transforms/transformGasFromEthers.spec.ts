/* eslint-disable sort-keys-fix/sort-keys-fix */
import { sampleEthersGas } from '../../test'
import { transformGasFromEthers } from './transformGasFromEthers'

describe('transformGasFromEthers', () => {
  it('returns values in the expected format', () => {
    const result = transformGasFromEthers(sampleEthersGas)
    expect(result).toBeObject()
    expect(result.baseFee).toBeNumber()
    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeUndefined()
    expect(result.feePerGas.medium).toBeUndefined()
    expect(result.feePerGas.high).toBeNumber()
    expect(result.feePerGas.veryHigh).toBeUndefined()
    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeUndefined()
    expect(result.priorityFeePerGas.medium).toBeUndefined()
    expect(result.priorityFeePerGas.high).toBeNumber()
    expect(result.priorityFeePerGas.veryHigh).toBeUndefined()
  })
  it('matches expected output', () => {
    const result = transformGasFromEthers(sampleEthersGas)
    expect(result).toMatchObject({
      baseFee: 13.447862081,
      feePerGas: {
        high: 28.395724162,
      },
      priorityFeePerGas: {
        high: 1.5,
      },
    })
  })
})
