import { XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1Schema } from '@xyo-network/etherchain-gas-ethereum-blockchain-payload-plugins'

import { transformGasFromEtherchainV1 } from './transformGasFromEtherchainV1'

const testGasResult: XyoEthereumGasEtherchainV1Payload = {
  currentBaseFee: 16.1,
  fast: 1,
  fastest: 1,
  recommendedBaseFee: 32.7,
  safeLow: 0.1,
  schema: XyoEthereumGasEtherchainV1Schema,
  standard: 0.2,
  timestamp: 1668648728013,
}

describe('transformGasFromEtherchainV1', () => {
  test('returns string results transformed to numeric values', () => {
    const result = transformGasFromEtherchainV1(testGasResult)
    expect(result).toBeObject()

    expect(result.gas).toBeObject()
    expect(result.gas.low).toBeNumber()
    expect(result.gas.medium).toBeNumber()
    expect(result.gas.high).toBeNumber()
    expect(result.gas.veryHigh).toBeNumber()

    expect(result.baseFee).toBeObject()
    expect(result.baseFee.medium).toBeNumber()

    expect(result.priorityFee).toBeObject()
    expect(result.priorityFee.medium).toBeNumber()
  })
})
