import { FeeData } from '../Model'
import { sampleEtherchainGasV1, sampleEtherchainGasV2, sampleEtherscanGas } from '../test'
import { average } from './average'
import { transformGasFromEtherchainV1, transformGasFromEtherchainV2, transformGasFromEtherscan } from './transforms'

const results: FeeData[] = [
  transformGasFromEtherchainV1(sampleEtherchainGasV1),
  transformGasFromEtherchainV2(sampleEtherchainGasV2),
  transformGasFromEtherscan(sampleEtherscanGas),
]

describe('average', () => {
  it('averages payloads', () => {
    const payloads = results
    const result = average(payloads)
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
  it('handles single payload', () => {
    const payloads = [results[0]]
    const result = average(payloads)
    expect(result).toBeObject()
  })
  it('handles no values', () => {
    const result = average()
    expect(result).toBeObject()
    expect(result.baseFee).toBeUndefined()
    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeUndefined()
    expect(result.feePerGas.medium).toBeUndefined()
    expect(result.feePerGas.high).toBeUndefined()
    expect(result.feePerGas.veryHigh).toBeUndefined()
    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeUndefined()
    expect(result.priorityFeePerGas.medium).toBeUndefined()
    expect(result.priorityFeePerGas.high).toBeUndefined()
    expect(result.priorityFeePerGas.veryHigh).toBeUndefined()
  })
})
