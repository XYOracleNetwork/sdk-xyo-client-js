import { PayloadWrapper } from '@xyo-network/payload'

import { XyoEthereumGasEthgasstationSchema, XyoEthereumGasEthgasstationWitnessConfigSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('XyoEthereumGasEthgasstationWitness', () => {
  testIf(apiKey)('returns observation', async () => {
    const sut = await XyoEthereumGasEthgasstationWitness.create({
      config: {
        apiKey,
        schema: XyoEthereumGasEthgasstationWitnessConfigSchema,
        targetSchema: XyoEthereumGasEthgasstationSchema,
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
    expect(actual.schema).toBe(XyoEthereumGasEthgasstationSchema)

    const answerWrapper = new PayloadWrapper(actual)
    expect(answerWrapper.valid).toBe(true)
  })

  describe('create', () => {
    it('throws if no params provided', async () => {
      await expect(XyoEthereumGasEthgasstationWitness.create()).toReject()
    })
  })
})
