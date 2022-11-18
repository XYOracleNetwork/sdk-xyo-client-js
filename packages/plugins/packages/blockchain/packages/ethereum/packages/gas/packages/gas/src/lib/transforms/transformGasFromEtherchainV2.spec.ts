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

    expect(result.feePerGas).toBeObject()
    expect(result.feePerGas.low).toBeNumber()
    expect(result.feePerGas.medium).toBeNumber()
    expect(result.feePerGas.high).toBeNumber()
    expect(result.feePerGas.veryHigh).toBeNumber()

    expect(result.baseFee).toBeNumber()

    expect(result.priorityFeePerGas).toBeObject()
    expect(result.priorityFeePerGas.medium).toBeNumber()
  })
})
