import { XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanSchema } from '@xyo-network/etherscan-ethereum-gas-payload-plugin'

import { transformGasFromEtherscan } from './transformGasFromEtherscan'

const testGasResult: XyoEthereumGasEtherscanPayload = {
  message: 'OK',
  result: {
    FastGasPrice: '13',
    LastBlock: '15986476',
    ProposeGasPrice: '13',
    SafeGasPrice: '12',
    gasUsedRatio: '0.345005466666667,0.391415466666667,0.424558733333333,0.513428133333333,0.428615366666667',
    suggestBaseFee: '11.744544475',
  },
  schema: XyoEthereumGasEtherscanSchema,
  status: '1',
  timestamp: 1668648728013,
}

describe('transformGasFromEtherscan', () => {
  test('returns string results transformed to numeric values', () => {
    const actual = transformGasFromEtherscan(testGasResult)
    expect(actual).toBeObject
    expect(actual.fastGasPrice).toBeNumber()
    expect(actual.gasUsedRatio).toBeArray()
    expect(actual.gasUsedRatio.length).toBeGreaterThan(0)
    actual.gasUsedRatio.map((x) => expect(x).toBeNumber())
    expect(actual.lastBlock).toBeNumber()
    expect(actual.proposeGasPrice).toBeNumber()
    expect(actual.safeGasPrice).toBeNumber()
    expect(actual.suggestBaseFee).toBeNumber()
  })
})
