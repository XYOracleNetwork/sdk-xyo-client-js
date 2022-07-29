import { EtherscanGasPriceResult } from './EtherscanGasPriceResult'
import { transformGasFromEtherscan } from './transformGasFromEtherscan'

const testGasResult: EtherscanGasPriceResult = {
  message: 'OK',
  result: {
    FastGasPrice: '14',
    LastBlock: '15104985',
    ProposeGasPrice: '14',
    SafeGasPrice: '13',
    gasUsedRatio: '0.470762306044819,0.0495756568995755,0.277106417265312,0.177710966485911,0.810219668615072',
    suggestBaseFee: '12.929815536',
  },
  status: '1',
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
