import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasBlocknativeSchema, XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

describe('XyoEthereumGasBlocknativeWitness', () => {
  it('returns observation', async () => {
    const sut = await XyoEthereumGasBlocknativeWitness.create({
      config: {
        schema: XyoEthereumGasBlocknativeWitnessConfigSchema,
        targetSchema: XyoEthereumGasBlocknativeSchema,
      },
    })
    const [actual] = await sut.observe()
    expect(actual.result).toBeObject()
    expect(actual.result.FastGasPrice).toBeString()
    expect(actual.result.gasUsedRatio).toBeString()
    expect(actual.result.LastBlock).toBeString()
    expect(actual.result.ProposeGasPrice).toBeString()
    expect(actual.result.SafeGasPrice).toBeString()
    expect(actual.result.suggestBaseFee).toBeString()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEthereumGasBlocknativeSchema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })
})
