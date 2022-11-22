import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationV1Schema, XyoEthereumGasEthgasstationV1WitnessConfigSchema } from './Schema'
import { XyoEthgasstationEthereumGasWitnessV1 } from './Witness'

describe('XyoEthgasstationEthereumGasWitnessV1', () => {
  test('returns observation', async () => {
    const sut = await XyoEthgasstationEthereumGasWitnessV1.create({
      config: { schema: XyoEthereumGasEthgasstationV1WitnessConfigSchema, targetSchema: XyoEthereumGasEthgasstationV1Schema },
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
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationV1Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })

  test('returns observation [no config]', async () => {
    const sut = await XyoEthgasstationEthereumGasWitnessV1.create()
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.currentBaseFee).toBeNumber()
    expect(actual.fast).toBeNumber()
    expect(actual.fastest).toBeNumber()
    expect(actual.recommendedBaseFee).toBeNumber()
    expect(actual.safeLow).toBeNumber()
    expect(actual.standard).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationV1Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
