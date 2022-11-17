import { TransactionCosts } from '../Model'
import { sampleEtherscanGas } from '../test'
import { average } from './average'
import { transformGasFromEtherscan } from './transforms'

const results: TransactionCosts[] = [transformGasFromEtherscan(sampleEtherscanGas)]

describe('average', () => {
  it('averages payloads', () => {
    const payloads = results
    const result = average(payloads)
    expect(result).toBeObject()
  })
  it('handles single payload', () => {
    const payloads = [results[0]]
    const result = average(payloads)
    expect(result).toBeObject()
  })
  it.skip('handles no values', () => {
    expect(average()).toBeUndefined()
  })
})
