import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEtherchainV1Schema, XyoEthereumGasEtherchainV1WitnessConfigSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

describe('XyoEtherchainEthereumGasWitnessV1', () => {
  test('returns observation', async () => {
    const sut = await XyoEtherchainEthereumGasWitnessV1.create({
      config: { schema: XyoEthereumGasEtherchainV1WitnessConfigSchema, targetSchema: XyoEthereumGasEtherchainV1Schema },
    })
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.currentBaseFee).toBeNumber()
    expect(actual.fast).toBeNumber()
    expect(actual.fastest).toBeNumber()
    expect(actual.recommendedBaseFee).toBeNumber()
    expect(actual.safeLow).toBeNumber()
    expect(actual.standard).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV1Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })

  test('returns observation [no config]', async () => {
    const sut = await XyoEtherchainEthereumGasWitnessV1.create()
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.currentBaseFee).toBeNumber()
    expect(actual.fast).toBeNumber()
    expect(actual.fastest).toBeNumber()
    expect(actual.recommendedBaseFee).toBeNumber()
    expect(actual.safeLow).toBeNumber()
    expect(actual.standard).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEtherchainV1Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
