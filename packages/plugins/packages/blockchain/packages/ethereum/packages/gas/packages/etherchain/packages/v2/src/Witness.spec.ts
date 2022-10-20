import { XyoEthereumGasEtherchainV2Schema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = new XyoEtherchainEthereumGasWitnessV2()
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV2Schema)
  })
})
