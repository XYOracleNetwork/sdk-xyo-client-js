import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationSchema, XyoEthereumGasEthgasstationWitnessConfigSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

describe('XyoEthereumGasEthgasstationWitness', () => {
  test('returns observation', async () => {
    const sut = await XyoEthereumGasEthgasstationWitness.create({
      config: {
        schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationSchema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
