import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationV2Schema, XyoEthereumGasEthgasstationV2WitnessConfigSchema } from './Schema'
import { XyoEthgasstationEthereumGasWitnessV2 } from './Witness'

describe('XyoEthgasstationEthereumGasWitnessV2', () => {
  test('returns observation', async () => {
    const sut = await XyoEthgasstationEthereumGasWitnessV2.create({
      config: { schema: XyoEthereumGasEthgasstationV2WitnessConfigSchema, targetSchema: XyoEthereumGasEthgasstationV2Schema },
    })
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationV2Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
  test('returns observation [no config]', async () => {
    const sut = await XyoEthgasstationEthereumGasWitnessV2.create()
    const [actual] = await sut.observe()
    expect(actual).toBeObject()
    expect(actual.code).toBeNumber()
    expect(actual.data).toBeObject()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationV2Schema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
