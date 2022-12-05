import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasBlocknativeSchema, XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

describe('XyoEthereumGasBlocknativeWitness', () => {
  it('returns observation', async () => {
    const sut = await XyoEthereumGasBlocknativeWitness.create({
      config: {
        schema: XyoEthereumGasBlocknativeWitnessConfigSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasBlocknativeSchema)
    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
