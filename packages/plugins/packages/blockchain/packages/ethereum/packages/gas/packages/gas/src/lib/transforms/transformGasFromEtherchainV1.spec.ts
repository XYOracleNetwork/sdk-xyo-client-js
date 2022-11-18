import { XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { transformGasFromEtherchainV1 } from './transformGasFromEtherchainV1'

const testGasResult: XyoEthereumGasEtherchainV1Payload = {
  currentBaseFee: 12.3,
  fast: 3,
  fastest: 4,
  recommendedBaseFee: 45.6,
  safeLow: 0.1,
  schema: XyoEthereumGasEtherchainV1Schema,
  standard: 0.2,
  timestamp: 1668648728013,
}

describe('transformGasFromEtherchainV1', () => {
  test('returns string results transformed to numeric values', () => {
    const result = transformGasFromEtherchainV1(testGasResult)
    expect(result).toBeObject()
    expect(result.baseFee).toBeNumber()
    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeUndefined()
    expect(result.feePerGas.medium).toBeUndefined()
    expect(result.feePerGas.high).toBeUndefined()
    expect(result.feePerGas.veryHigh).toBeUndefined()
    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.low).toBeNumber()
    expect(result.priorityFeePerGas.medium).toBeNumber()
    expect(result.priorityFeePerGas.high).toBeNumber()
    expect(result.priorityFeePerGas.veryHigh).toBeNumber()
  })
  it('matches expected output', () => {
    const result = transformGasFromEtherchainV1(testGasResult)
    expect(result).toMatchObject({
      baseFee: 12300000000,
      feePerGas: {},
      priorityFeePerGas: {
        high: 3000000000,
        low: 100000000,
        medium: 200000000,
        veryHigh: 4000000000,
      },
    })
  })
})
