import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoEtherchainEthereumGasWitnessV1({ schema: '' })
    const actual = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.currentBaseFee).toBeNumber()
    expect(actual.fast).toBeNumber()
    expect(actual.fastest).toBeNumber()
    expect(actual.recommendedBaseFee).toBeNumber()
    expect(actual.safeLow).toBeNumber()
    expect(actual.standard).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEtherchainEthereumGasWitnessV1.schema)
  })
})
