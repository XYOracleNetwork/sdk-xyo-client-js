import { XyoEthereumGasEtherchainV2Schema, XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

describe('Witness', () => {
  test('returns observation', async () => {
    const sut = await XyoEtherchainEthereumGasWitnessV2.create({
      config: { schema: XyoEthereumGasEtherchainV2WitnessConfigSchema, targetSchema: XyoEthereumGasEtherchainV2Schema },
    })
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV2Schema)
  })
})
