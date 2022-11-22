import { sampleBlocknativeGas } from '../../test'
import { transformGasFromBlocknative } from './transformGasFromBlocknative'

describe('transformGasFromEtherscan', () => {
  test('returns string results transformed to numeric values', () => {
    const result = transformGasFromBlocknative(sampleBlocknativeGas)
    expect(result).toBeObject()

    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeNumber()
    expect(result.feePerGas.medium).toBeNumber()
    expect(result.feePerGas.high).toBeNumber()
    expect(result.feePerGas.veryHigh).toBeNumber()

    expect(result.baseFee).toBeNumber()

    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeNumber()
    expect(result.priorityFeePerGas.medium).toBeNumber()
    expect(result.priorityFeePerGas.high).toBeNumber()
    expect(result.priorityFeePerGas.veryHigh).toBeNumber()
  })
})
