/* eslint-disable sort-keys-fix/sort-keys-fix */
import { sampleEtherchainGasV2 } from '../../test'
import { transformGasFromEtherchainV2 } from './transformGasFromEtherchainV2'

describe('transformGasFromEtherchainV2', () => {
  it('returns values in the expected format', () => {
    const result = transformGasFromEtherchainV2(sampleEtherchainGasV2)
    expect(result).toBeObject()
    expect(result.baseFee).toBeUndefined()
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
    const result = transformGasFromEtherchainV2(sampleEtherchainGasV2)
    expect(result).toMatchObject({
      baseFee: undefined,
      feePerGas: {
        low: 11200000000,
        medium: 12000000000,
        high: 19803047330,
        veryHigh: 29714286170,
      },
      priorityFeePerGas: {},
    })
  })
})
