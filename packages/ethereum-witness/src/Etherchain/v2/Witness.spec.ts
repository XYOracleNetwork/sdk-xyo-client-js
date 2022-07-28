import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoEtherchainEthereumGasWitnessV2()
    const actual = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.data.fast).toBeNumber()
    expect(actual.data.priceUSD).toBeNumber()
    expect(actual.data.rapid).toBeNumber()
    expect(actual.data.slow).toBeNumber()
    expect(actual.data.standard).toBeNumber()
    expect(actual.data.timestamp).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe('network.xyo.blockchain.ethereum.gas.etherchain.v2')
  })
})
